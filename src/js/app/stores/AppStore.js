import AppDispatcher from 'AppDispatcher'
import AppConstants from 'AppConstants'
import {EventEmitter2} from 'eventemitter2'
import assign from 'object-assign'
import data from 'GlobalData'
import Router from 'Router'

function _getContentScope() {
    var hashObj = Router.getNewHash()
    return AppStore.getRoutePathScopeById(hashObj.hash)
}
function _getPageAssetsToLoad() {
    var scope = _getContentScope()
    var hashObj = Router.getNewHash()
    var type = _getTypeOfPage()
    var manifest;

    if(type != AppConstants.HOME) {
        var filenames = [
            'character.png',
            'character-bg.jpg',
            'shoe.png',
            'shoe-bg.jpg'
        ]
        manifest = _addBasePathsToUrls(filenames, hashObj.parent, hashObj.target, type)
    }

    // In case of extra assets
    if(scope.assets != undefined) {
        var assets = scope.assets
        var assetsManifest;
        if(type == AppConstants.HOME) {
            assetsManifest = _addBasePathsToUrls(assets, 'home', hashObj.target, type)
        }else{
            assetsManifest = _addBasePathsToUrls(assets, hashObj.parent, hashObj.target, type)       
        }
        manifest = (manifest == undefined) ? assetsManifest : manifest.concat(assetsManifest)
    }

    return manifest
}
function _addBasePathsToUrls(urls, pageId, targetId, type) {
    var basePath = (type == AppConstants.HOME) ? _getHomePageAssetsBasePath() : _getPageAssetsBasePathById(pageId, targetId)
    var manifest = []
    for (var i = 0; i < urls.length; i++) {
        var splitter = urls[i].split('.')
        var fileName = splitter[0]
        var extension = splitter[1]
        var id = pageId + '-'
        if(targetId) id += targetId + '-'
        id += fileName
        manifest[i] = {
            id: id,
            src: basePath + fileName + _getImageExtensionByDeviceRatio() + '.' + extension
        }
    }
    return manifest
}
function _getPageAssetsBasePathById(id, assetGroupId) {
    return AppStore.baseMediaPath() + 'image/diptyque/' + id + '/' + assetGroupId + '/'
}
function _getHomePageAssetsBasePath() {
    return AppStore.baseMediaPath() + 'image/home/'
}
function _getImageExtensionByDeviceRatio() {
    // return '@' + _getDeviceRatio() + 'x'
    return ''
}
function _getDeviceRatio() {
    var scale = (window.devicePixelRatio == undefined) ? 1 : window.devicePixelRatio
    return (scale > 1) ? 2 : 1
}
function _getTypeOfPage(hash) {
    var h = hash || Router.getNewHash()
    if(h.parts.length == 2) return AppConstants.DIPTYQUE
    else return AppConstants.HOME
}
function _getPageContent() {
    var hashObj = Router.getNewHash()
    var hash = hashObj.hash.length < 1 ? '/' : hashObj.hash
    var content = data.routing[hash]
    return content
}
function _getContentByLang(lang) {
    return data.content.lang[lang]
}
function _getGlobalContent() {
    return _getContentByLang(AppStore.lang())
}
function _getAppData() {
    return data
}
function _getDefaultRoute() {
    return data['default-route']
}
function _windowWidthHeight() {
    return {
        w: window.innerWidth,
        h: window.innerHeight
    }
}

var AppStore = assign({}, EventEmitter2.prototype, {
    emitChange: function(type, item) {
        this.emit(type, item)
    },
    pageContent: function() {
        return _getPageContent()
    },
    appData: function() {
        return _getAppData()
    },
    defaultRoute: function() {
        return _getDefaultRoute()
    },
    globalContent: function() {
        return _getGlobalContent()
    },
    pageAssetsToLoad: function() {
        return _getPageAssetsToLoad()
    },
    getRoutePathScopeById: function(id) {
        id = id.length < 1 ? '/' : id
        return data.routing[id]
    },
    baseMediaPath: function() {
        return AppStore.getEnvironment().static
    },
    getEnvironment: function() {
        return AppConstants.ENVIRONMENTS[ENV]
    },
    getTypeOfPage: function(hash) {
        return _getTypeOfPage(hash)
    },
    getHomeVideos: function() {
        return data['home-videos']
    },
    generalInfos: function() {
        return data.content
    },
    lang: function() {
        var defaultLang = true
        for (var i = 0; i < data.langs.length; i++) {
            var lang = data.langs[i]
            if(lang == JS_lang) {
                defaultLang = false
            }
        };
        return (defaultLang == true) ? 'en' : JS_lang
    },
    Window: function() {
        return _windowWidthHeight()
    },
    addPXChild: function(item) {
        AppStore.PXContainer.add(item.child)
    },
    removePXChild: function(item) {
        AppStore.PXContainer.remove(item.child)
    },
    Parent: undefined,
    Canvas: undefined,
    Orientation: AppConstants.LANDSCAPE,
    Detector: {
        isMobile: undefined
    },
    dispatcherIndex: AppDispatcher.register(function(payload){
        var action = payload.action
        switch(action.actionType) {
            case AppConstants.WINDOW_RESIZE:
                AppStore.Window.w = action.item.windowW
                AppStore.Window.h = action.item.windowH
                AppStore.Orientation = (AppStore.Window.w > AppStore.Window.h) ? AppConstants.LANDSCAPE : AppConstants.PORTRAIT
                AppStore.emitChange(action.actionType)
                break
            default:
                AppStore.emitChange(action.actionType, action.item) 
                break
        }
        return true
    })
})


export default AppStore

