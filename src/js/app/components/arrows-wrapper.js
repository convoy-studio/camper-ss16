import dom from 'dom-hand'
import AppStore from 'AppStore'
import AppConstants from 'AppConstants'

export default (parent, onMouseEnter, onMouseLeave)=> {
	var scope;
	var arrowsWrapper = dom.select('.arrows-wrapper', parent)
	var leftArrow = dom.select('.arrow.left', arrowsWrapper)
	var rightArrow = dom.select('.arrow.right', arrowsWrapper)
	var arrows = {
		left: {
			el: leftArrow,
			icons: dom.select.all('svg', leftArrow),
			iconsWrapper: dom.select('.icons-wrapper', leftArrow),
			background: dom.select('.background', leftArrow)
		},
		right: {
			el: rightArrow,
			icons: dom.select.all('svg', rightArrow),
			iconsWrapper: dom.select('.icons-wrapper', rightArrow),
			background: dom.select('.background', rightArrow)
		}
	}

	dom.event.on(arrows.left.el, 'mouseenter', onMouseEnter)
	dom.event.on(arrows.left.el, 'mouseleave', onMouseLeave)
	dom.event.on(arrows.right.el, 'mouseenter', onMouseEnter)
	dom.event.on(arrows.right.el, 'mouseleave', onMouseLeave)

	scope = {
		background: (dir)=> {
			return arrows[dir].background
		},
		resize: ()=> {

			var windowW = AppStore.Window.w
			var windowH = AppStore.Window.h

			var arrowSize = dom.size(arrows.left.icons[1])
			var offsetY = 20
			var bgWidth = AppConstants.SIDE_EVENT_PADDING

			arrows.right.el.style.left = windowW - bgWidth + 'px'

			arrows.left.background.style.width = bgWidth + 'px'
			arrows.left.background.style.height = windowH + 'px'
			arrows.left.iconsWrapper.style.top = (windowH >> 1) - (arrowSize[0] >> 1) - offsetY + 'px'
			arrows.left.iconsWrapper.style.left = AppConstants.PADDING_AROUND + 'px'

			arrows.right.background.style.width = bgWidth + 'px'
			arrows.right.background.style.height = windowH + 'px'
			arrows.right.iconsWrapper.style.top = (windowH >> 1) - (arrowSize[0] >> 1) - offsetY + 'px'
			arrows.right.iconsWrapper.style.left = bgWidth - arrowSize[0] - AppConstants.PADDING_AROUND + 'px'
				
		},
		over: (dir)=> {
			var arrow = arrows[dir]
			dom.classes.add(arrow.el, 'hovered')
		},
		out: (dir)=> {
			var arrow = arrows[dir]
			dom.classes.remove(arrow.el, 'hovered')
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