'use strict';

var livereload = require('gulp-livereload');

// gulp
var gulp = require('gulp')
var gulpif = require('gulp-if')
var gutil = require('gulp-util')
var copy = require('gulp-copy')
var shell = require('gulp-shell')
var concat = require('gulp-concat')
var rename = require('gulp-rename')
var sass = require('gulp-sass')
var notify = require('gulp-notify')
var uglify = require('gulp-uglify')
var gulpsync = require('gulp-sync')(gulp)
var imagemin = require('gulp-imagemin')
var gcallback = require('gulp-callback')
var sourcemaps = require('gulp-sourcemaps')
var postcss = require('gulp-postcss')
var bundle = require('gulp-bundle-assets')
var jsonminify = require('gulp-jsonminify');

// tranforms
var browserify = require('browserify')
var watchify = require('watchify')
var babelify = require('babelify')
var hbsfy = require('hbsfy')
var svg = require('svg-browserify');

// optims
var pngquant = require('imagemin-pngquant')
var imageminPngcrush = require('imagemin-pngcrush');

var recursive = require('recursive-readdir');

var gm = require('gm');

// vinyl
var buffer = require('vinyl-buffer')
var transform = require('vinyl-transform')
var source = require('vinyl-source-stream')

// css
var autoprefixer = require('autoprefixer-core')

var argv = require('yargs').argv
var del = require('del')
var exec = require('child_process').exec
var fs = require('fs')
var path = require('path')
var bowerResolve = require('bower-resolve')
var nodeResolve = require('resolve')
var packagesHelper = require('./helper/packagesHelper')

var deploy = argv._.length ? argv._[0] === 'deploy' : false;
var deployMobile = argv._.length ? argv._[0] === 'deploy_mobile' : false;
var mobile = argv._.length ? argv._[0] === 'mobile' : false;
mobile = (deployMobile) ? deployMobile : mobile
deploy = (deployMobile) ? deployMobile : deploy
var watch = argv._.length ? argv._[0] === 'watch' : true;
watch = (mobile) ? mobile : watch
var srcBasePath = (mobile) ? 'src_mobile' : 'src'
var destPrefix =  (mobile) ? '_mobile' : ''
var production = deploy

// Aliasify App's paths
var aliasifyConfig = require('./config/aliasifyConfig')
aliasifyConfig.configDir = __dirname
aliasifyConfig.buildAliases(srcBasePath)
var aliasify = require('aliasify').configure(aliasifyConfig)

var browserSync = require("browser-sync")
browserSync.create('My Server')
var bundler = browserify({
    entries: srcBasePath+'/js/Main.js',
    extensions: ['.js'],
    cache: {},
    packageCache: {},
    fullPaths: true,
    debug: !production
})

var app_script_files = [
    'lib/E-v1.js',
    'lib/jquery.min.js',
    'lib/pixi.min.js',
    'lib/preloadjs-0.6.1.min.js',
    'lib/SplitText.min.js',
    'vendor/vendor.js',
    'lib/jquery.simpleWeather.min.js'
]

// Error notification
var beep = function() {
    var file = 'gulp/error.wav';
    console.log("afplay " + file);
    exec("afplay " + file);
};

var handleError = function(task) {
    return function(err) {
        beep();
        notify.onError({
            message: task + ' failed, check the logs..',
            sound: false
        })(err);
        gutil.log(gutil.colors.bgRed(task + ' error:'), gutil.colors.red(err));
    };
};

// Tasks
var tasks = {
    clean: function(cb) {
        del(['deploy/'], cb);
    },
    clearJs: function(cb) {
        del(['www/js/**/*.*'], cb);
    },
    sass: function() {
        return gulp.src('./'+srcBasePath+'/scss/app.scss')
            // sourcemaps + sass + error handling
            .pipe(gulpif(!production, sourcemaps.init()))
            .pipe(sass({
                sourceComments: !production,
                outputStyle: production ? 'compressed' : 'nested',
                includePaths: ['./'+srcBasePath+'/scss']
            }))
            .on('error', function(err){
                // print the error (can replace with gulp-util)
                gutil.log(gutil.colors.black.underline.bgYellow(err.message));
                // end this stream
                this.emit('end');
            })
            // generate .maps
            .pipe(gulpif(!production, sourcemaps.write({
                'includeContent': false,
                'sourceRoot': '.'
            })))
            // autoprefixer
            .pipe(gulpif(!production, sourcemaps.init({
                'loadMaps': true
            })))
            .pipe(postcss([
                autoprefixer({
                    browsers: 'last 2 versions, Explorer >= 7, > 5%'
                })
            ]))
            // we don't serve the source files
            // so include scss content inside the sourcemaps
            .pipe(sourcemaps.write({
                'includeContent': true
            }))
            .pipe(rename('styles'+destPrefix+'.css'))
            // write sourcemaps to a specific directory
            // give it a file and save
            .pipe(gulp.dest('./www/css'))
            .pipe(livereload())
    },
    browserify: function() {
        var rebundle = function() {
            return bundler.bundle()

                .on('error', function(err){
                    // print the error (can replace with gulp-util)
                    gutil.log(gutil.colors.black.underline.bgYellow(err.message));
                    // end this stream
                    this.emit('end');
                })

                .pipe(source('app'+destPrefix+'.js'))
                .pipe(gulpif(production, buffer()))
                .pipe(gulpif(production, uglify()))
                .pipe(gulp.dest('./www/js'))
                .pipe(livereload())

        }
        
        return rebundle();
    },

    optimizeJson: function() {

        var paths = {
            files: './deploy/www/data/**/*.json',
            filesDest: './deploy/www/data/',
        };

        return gulp.src(paths.files, {base: paths.filesDest})
            .pipe(jsonminify())
            .pipe(gulp.dest(paths.filesDest));
    },

    concatAppScripts: function() {

        var desktop_files = app_script_files.slice(0)
        desktop_files.push('js/app.js')

        gulp.src(desktop_files, {cwd: './deploy/www/'})
            .pipe(concat('all.js'))
            .pipe(gulp.dest('./deploy/www/js/'));
    },

    concatAppScriptsMobile: function() {

        var mobile_files = app_script_files.slice(0)
        mobile_files.push('js/app_mobile.js')

        gulp.src(mobile_files, {cwd: './deploy/www/'})
            .pipe(concat('all_mobile.js'))
            .pipe(gulp.dest('./deploy/www/js/'));
    },

    optimizeImages: function() {

        // var paths = {
        //     files: './deploy/**',
        //     filesDest: './deploy/www/image',
        // };

        var paths = {
            files: './www/**',
            filesDest: './www/image',
        };

        return gulp.src(paths.files, {base: paths.filesDest})
            .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
            .pipe(gulp.dest(paths.filesDest));
    },

    generateSizeImages: function() {

        var from_directory = './www/image';

        recursive(from_directory, [], (err, files)=> {

            var characterOriginalSizeH = 960
            for (var i = 0; i < files.length; i++) {
                var file = files[i]
                if(file.indexOf('character.png') > -1) {
                    var s = file.split('/')
                    var filename = s[s.length-1]
                    var name = filename.split('.')[0]
                    var ext = filename.split('.')[1]
                    var baseUrl = file.replace(filename, '')
                    var path_2x = baseUrl + name + '@2x' + '.' + ext
                    var path_1x = baseUrl + name + '@1x' + '.' + ext

                    gm(file)
                        .resize(characterOriginalSizeH - 200, null)
                        .autoOrient()
                        .write(path_2x, function(err){
                            if (err) return console.dir(arguments)
                        })
                    gm(file)
                        .resize(characterOriginalSizeH - 400, null)
                        .autoOrient()
                        .write(path_1x, function(err){
                            if (err) return console.dir(arguments)
                        })

                }
            };

        });

    },

    deployDir: function() {
        return gulp.src("")
            .pipe(shell([
                'rm -rf deploy',
                'mkdir deploy'
            ]));
    },
    deployCopy: function() {
        return gulp.src("")
            .pipe(shell([
                'cp -rf www deploy'
            ]));
    },
    deployCopyMobile: function() {
        return gulp.src("")
            .pipe(shell([
                'cp -rf www/js/app_mobile.js deploy/www/js/'
            ]))
            .pipe(shell([
                'cp -rf www/css/styles_mobile.css deploy/www/css/'
            ]));
    },
    buildVendor: function () {
        // this task will go through ./bower.json and
        // uses bower-resolve to resolve its full path.
        // the full path will then be added to the bundle using require()
        var b = browserify({
            insertGlobals: true,
            // generate source maps in non-production environment
            debug: !production
        });
        // get all bower components ids and use 'bower-resolve' to resolve
        // the ids to their full path, which we need for require()
        packagesHelper.getBowerPackageIds().forEach(function (id) {
            var resolvedPath = bowerResolve.fastReadSync(id);
            gutil.log(gutil.colors.black.bgBlue("Bower package", id));
            b.require(resolvedPath, {
                // exposes the package id, so that we can require() from our code.
                // for eg:
                // require('./vendor/angular/angular.js', {expose: 'angular'}) enables require('angular');
                // for more information: https://github.com/substack/node-browserify#brequirefile-opts
                expose: id
            });
        });
        // do the similar thing, but for npm-managed modules.
        // resolve path using 'resolve' module
        packagesHelper.getNPMPackageIds().forEach(function (id) {
            gutil.log(gutil.colors.black.bgBlue("Npm dev dependency package", id));
            b.require(nodeResolve.sync(id), { expose: id });
        });
        var stream = b.bundle()
            .pipe(source('vendor.js'))
            .pipe(gulpif(production, buffer()))
            .pipe(gulpif(production, uglify()))
            .pipe(gulp.dest('./www/vendor'));
        return stream;
    },
    buildApp: function () {
        if (watch) {
            bundler = watchify(bundler)
        }

        tasks.transform()
        // mark vendor libraries defined in bower.json as an external library,
        // so that it does not get bundled with app.js.
        // instead, we will load vendor libraries from vendor.js bundle
        packagesHelper.getBowerPackageIds().forEach(function (lib) {
            bundler.external(lib);
        });
        // do the similar thing, but for npm-managed modules.
        // resolve path using 'resolve' module
        packagesHelper.getNPMPackageIds().forEach(function (id) {
            bundler.external(id);
        });

        tasks.browserify()
    },
    transform: function() {
        bundler.transform(babelify)
        bundler.transform(hbsfy)
        bundler.transform(aliasify)
        bundler.transform(svg)
    }
}


gulp.task('browser-sync', function() {
    livereload.listen()
});
gulp.task('browser-exit', function() {
    browserSync.exit();
});
gulp.task('reload', function() {
    browserSync.reload();
});
gulp.task('reload-sass', ['sass'], function(){
    browserSync.reload();
});
bundler.on('update', function() {
    tasks.browserify()
});

gulp.task('watch', function() {
    gulp.watch('./'+srcBasePath+'/scss/**/*.scss', ['reload-sass']);
    gulp.watch('./www/**/*.json', ['reload']);
    gutil.log(gutil.colors.bgRed('Watching for changes...'));
});

gulp.task('clean', tasks.clean);
gulp.task('sass', tasks.sass);
gulp.task('clearJs', tasks.clearJs);
gulp.task('browserify', tasks.browserify);
gulp.task('deployDir', tasks.deployDir);
gulp.task('deployCopy', tasks.deployCopy);
gulp.task('transform', tasks.transform);
gulp.task('optimize-images', tasks.optimizeImages);
gulp.task('optimize-json', tasks.optimizeJson);
gulp.task('build-vendor', tasks.buildVendor);
gulp.task('build-app', tasks.buildApp);
gulp.task('deploy-copy-mobile', tasks.deployCopyMobile);
gulp.task('concat-app-scripts', tasks.concatAppScripts);
gulp.task('concat-app-scripts-mobile', tasks.concatAppScriptsMobile);
gulp.task('generate-size-images', tasks.generateSizeImages);

gulp.task('build', [
    'browser-sync',
    'sass',
    'build-vendor',
    'build-app',
]);

gulp.task('deploy', gulpsync.sync([
    'build',
    'clean',
    'deployDir',
    'deployCopy',
    'optimize-json',
    'concat-app-scripts',
    'browser-exit'
]));

gulp.task('deploy_mobile', gulpsync.sync([
    'build',
    'deploy-copy-mobile',
    'concat-app-scripts-mobile',
    'browser-exit'
]));

gulp.task('default', [ 'build', 'watch']);
gulp.task('mobile', [ 'build', 'watch']);

// gulp (watch) : for development and browser reload
// gulp build : for a one off development build
// gulp mobile : for a one off development build for mobile
// gulp deploy : for a minified production build
// gulp deploy_mobile : for a minified production build for mobile
// gulp optimize-images : optimise image on deploy
// gulp generate-size-images : generate different size images for retina and no-retina

