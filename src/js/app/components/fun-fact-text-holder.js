import AppStore from 'AppStore'
import AppConstants from 'AppConstants'
import coloryRects from 'colory-rects'

export default (pxContainer)=> {
	var scope;

	var holder = new PIXI.Container()
	pxContainer.addChild(holder)

	var colorRects = coloryRects(holder, { h:147, s:87, v:92 })

	var open = ()=> {
		scope.isOpen = true
		colorRects.open()
	}
	var close = ()=> {
		scope.isOpen = false
		colorRects.close()
	}

	scope = {
		isOpen: false,
		open: open,
		close: close,
		resize: ()=>{
			var windowW = AppStore.Window.w
			var windowH = AppStore.Window.h

			var size = [(windowW >> 1) + 1, windowH]

			colorRects.resize(size[0], size[1], AppConstants.TOP)
		},
		clear: ()=> {
			pxContainer.removeChild(holder)
			colorRects.clear()
			colorRects = null
			holder = null
		}
	}
	return scope
}