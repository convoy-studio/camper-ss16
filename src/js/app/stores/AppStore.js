import AppDispatcher from 'AppDispatcher'
import AppConstants from 'AppConstants'
import {EventEmitter2} from 'eventemitter2'
import assign from 'object-assign'
import data from 'GlobalData'
import Router from 'Router'

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

