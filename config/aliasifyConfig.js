var recursiveReadSync = require('recursive-readdir-sync')

module.exports = {
	buildAliases: function(srcBasePath) {

		var allPathStr = "{"
		var jsRelPath = srcBasePath+'/js'
		var files = recursiveReadSync(jsRelPath);

		for (var i = 0; i < files.length; i++) {
			var file = files[i]
			if(file.indexOf('.js') > -1) {
				var path = file.replace(".js", "")
				var splitter = path.split('/')
				var filename = splitter[splitter.length-1]
				var fPath = "./" + path
				var str = '"' + filename + '": "' + fPath + '",'
				allPathStr += str
			}else if(file.indexOf('.hbs') > -1) {
				var path = file.replace(".hbs", "")
				var splitter = path.split('/')
				var filename = splitter[splitter.length-1]
				var fPath = "./" + path
				var str = '"' + filename + '_hbs' + '": "' + fPath + '.hbs",'
				allPathStr += str
			}
		};
		allPathStr = allPathStr.slice(0, allPathStr.length-1)
		allPathStr += "}"
		var obj = JSON.parse(allPathStr)
		this.aliases = obj
		this.aliases.GlobalData = './www/data/data.json'
		console.log('Aliases created.')
	},
	aliases: "",
    configDir: "",
    verbose: false
}