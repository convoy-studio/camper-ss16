import AppStore from 'AppStore'
import AppConstants from 'AppConstants'
import dom from 'dom-hand'

var aroundBorder = (parent)=> {

	var scope;

	var $container = dom.select('.around-border-container', parent)
	var top = dom.select('.top', $container)
	var bottom = dom.select('.bottom', $container)
	var left = dom.select('.left', $container)
	var right = dom.select('.right', $container)

	var $lettersContainer = dom.select('.around-border-letters-container', parent)
	var topLetters = dom.select('.top', $lettersContainer).children
	var bottomLetters = dom.select('.bottom', $lettersContainer).children
	var leftLetters = dom.select('.left', $lettersContainer).children
	var rightLetters = dom.select('.right', $lettersContainer).children

	scope = {
		resize: ()=> {
			var borderSize = 10
			var windowW = AppStore.Window.w
			var windowH = AppStore.Window.h
			var blockSize = [ windowW / AppConstants.GRID_ROWS, windowH / AppConstants.GRID_COLUMNS ]

			top.style.width = windowW + 'px'
			bottom.style.width = windowW + 'px'
			bottom.style.top = windowH - borderSize + 'px'
			left.style.height = right.style.height = windowH + 'px'
			right.style.left = windowW - borderSize + 'px'

			for (var i = 0; i < topLetters.length; i++) {
				var tl = topLetters[i]
				tl.style.left = (blockSize[0] >> 1) + (blockSize[0] * i) - 2 + 'px'
				tl.style.top = -2 + 'px'
			};
			for (var i = 0; i < bottomLetters.length; i++) {
				var bl = bottomLetters[i]
				bl.style.left = (blockSize[0] >> 1) + (blockSize[0] * i) - 2 + 'px'
				bl.style.top = windowH - 12 + 'px'
			};
			for (var i = 0; i < leftLetters.length; i++) {
				var ll = leftLetters[i]
				ll.style.top = (blockSize[1] >> 1) + (blockSize[1] * i) - 2 + 'px'
				ll.style.left = 2 + 'px'
			};
			for (var i = 0; i < rightLetters.length; i++) {
				var rl = rightLetters[i]
				rl.style.top = (blockSize[1] >> 1) + (blockSize[1] * i) - 2 + 'px'
				rl.style.left = windowW - 8 + 'px'
			};
		},
		clear: ()=> {
			topLetters = null
			bottomLetters = null
			leftLetters = null
			rightLetters = null
		}
	} 

	return scope
}

export default aroundBorder