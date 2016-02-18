import AppConstants from 'AppConstants'
import AppDispatcher from 'AppDispatcher'
import AppStore from 'AppStore'

function _proceedTransitionInAction(pageId) {
    AppDispatcher.handleViewAction({
        actionType: AppConstants.PAGE_ASSETS_LOADED,
        item: pageId
    })  
}

var AppActions = {
    pageHasherChanged: function(pageId) {
        AppDispatcher.handleViewAction({
            actionType: AppConstants.PAGE_HASHER_CHANGED,
            item: pageId
        })
    },
    loadPageAssets: function(pageId) {
        var manifest = AppStore.pageAssetsToLoad()
        if(manifest.length < 1) {
            _proceedTransitionInAction(pageId)
        }else{
            AppStore.Preloader.load(manifest, ()=>{
                _proceedTransitionInAction(pageId)
            })
        }
    },
    windowResize: function(windowW, windowH) {
        AppDispatcher.handleViewAction({
            actionType: AppConstants.WINDOW_RESIZE,
            item: { windowW:windowW, windowH:windowH }
        })
    },
    pxContainerIsReady: function(component) {
        AppDispatcher.handleViewAction({
            actionType: AppConstants.PX_CONTAINER_IS_READY,
            item: component
        })            
    },
    pxAddChild: function(child) {
        AppDispatcher.handleViewAction({
            actionType: AppConstants.PX_CONTAINER_ADD_CHILD,
            item: child
        })            
    },
    pxRemoveChild: function(child) {
        AppDispatcher.handleViewAction({
            actionType: AppConstants.PX_CONTAINER_REMOVE_CHILD,
            item: child
        })            
    },
    openFunFact: function() {
        AppDispatcher.handleViewAction({
            actionType: AppConstants.OPEN_FUN_FACT,
            item: undefined
        })
    },
    closeFunFact: function() {
        AppDispatcher.handleViewAction({
            actionType: AppConstants.CLOSE_FUN_FACT,
            item: undefined
        })  
    },
    cellMouseEnter: function(id) {
        AppDispatcher.handleViewAction({
            actionType: AppConstants.CELL_MOUSE_ENTER,
            item: id
        }) 
    },
    cellMouseLeave: function(id) {
        AppDispatcher.handleViewAction({
            actionType: AppConstants.CELL_MOUSE_LEAVE,
            item: id
        })
    }
}

export default AppActions


      
