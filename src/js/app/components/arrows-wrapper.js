import dom from 'dom-hand'
import AppStore from 'AppStore'
import AppConstants from 'AppConstants'

export default (parent, onMouseEnter, onMouseLeave)=> {
	var scope;
	var arrows = {
		left: {
			el: dom.select('.arrows-wrapper .arrow.left', parent)
		},
		right: {
			el: dom.select('.arrows-wrapper .arrow.right', parent)
		}
	}

	dom.event.on(arrows.left.el, 'mouseenter', onMouseEnter)
	dom.event.on(arrows.left.el, 'mouseleave', onMouseLeave)
	dom.event.on(arrows.right.el, 'mouseenter', onMouseEnter)
	dom.event.on(arrows.right.el, 'mouseleave', onMouseLeave)

	scope = {
		resize: ()=> {

			var windowW = AppStore.Window.w
			var windowH = AppStore.Window.h

			var arrowSize = dom.size(arrows.left.el)
			var offsetY = 20
			arrows.left.el.style.left = AppConstants.PADDING_AROUND + 'px'
			arrows.left.el.style.top = (windowH >> 1) - (arrowSize[0] >> 1) - offsetY + 'px'
			arrows.right.el.style.left = windowW - arrowSize[0] - AppConstants.PADDING_AROUND  + 'px'
			arrows.right.el.style.top = (windowH >> 1) - (arrowSize[0] >> 1) - offsetY + 'px'

		},
		clear: ()=> {
			dom.event.off(arrows.left.el, 'mouseenter', onMouseEnter)
			dom.event.off(arrows.left.el, 'mouseleave', onMouseLeave)
			dom.event.off(arrows.right.el, 'mouseenter', onMouseEnter)
			dom.event.off(arrows.right.el, 'mouseleave', onMouseLeave)
			arrows = null
		}
	}
	return scope
}