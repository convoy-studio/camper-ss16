import AppStore from 'AppStore'
import AppConstants from 'AppConstants'
import dom from 'dom-handler'

var aroundBorder = (parent)=> {

	var scope;

	var $container = dom.select('.around-border-container', parent)
	var top = dom.select('.top', $container)
	var bottom = dom.select('.bottom', $container)
	var left = dom.select('.left', $container)
	var right = dom.select('.right', $container)
	var leftStepTop = dom.select('.left-step-top', $container)
	var leftStepBottom = dom.select('.left-step-bottom', $container)
	var rightStepTop = dom.select('.right-step-top', $container)
	var rightStepBottom = dom.select('.right-step-bottom', $container)

	var $lettersContainer = dom.select('.around-border-letters-container', parent)
	var topLetters = dom.select('.top', $lettersContainer).children
	var bottomLetters = dom.select('.bottom', $lettersContainer).children
	var leftLetters = dom.select('.left', $lettersContainer).children
	var rightLetters = dom.select('.right', $lettersContainer).children
	var leftStepTopLetters = dom.select('.left-step-top', $lettersContainer).children
	var leftStepBottomLetters = dom.select('.left-step-bottom', $lettersContainer).children
	var rightStepTopLetters = dom.select('.right-step-top', $lettersContainer).children
	var rightStepBottomLetters = dom.select('.right-step-bottom', $lettersContainer).children

	scope = {
		resize: ()=> {
			var borderSize = 10
			var windowW = AppStore.Window.w
			var windowH = AppStore.Window.h
			var blockSize = [ windowW / AppConstants.GRID_ROWS, windowH / AppConstants.GRID_COLUMNS ]

			top.style.width = windowW + 'px'
			bottom.style.width = blockSize[0] * 3 + 'px'
			bottom.style.top = windowH - borderSize + 'px'
			bottom.style.left = blockSize[0] * 2 + 'px'
			left.style.height = right.style.height = windowH - blockSize[1] + 'px'
			right.style.left = windowW - borderSize + 'px'

			leftStepTop.style.width = blockSize[0] * 2 + 'px'
			leftStepTop.style.top = windowH - blockSize[1] + 'px'
			leftStepBottom.style.height = blockSize[1] + 'px'
			leftStepBottom.style.left = (blockSize[0] * 2) - borderSize + 1 + 'px'
			leftStepBottom.style.top = windowH - blockSize[1] + 'px'

			rightStepTop.style.width = blockSize[0] * 2 + 'px'
			rightStepTop.style.top = windowH - blockSize[1] + 'px'
			rightStepTop.style.left = windowW - (blockSize[0] * 2) + 'px'
			rightStepBottom.style.height = blockSize[1] + 'px'
			rightStepBottom.style.left = windowW - (blockSize[0] * 2) + 'px'
			rightStepBottom.style.top = windowH - blockSize[1] + 'px'

			for (var i = 0; i < topLetters.length; i++) {
				var tl = topLetters[i]
				tl.style.left = (blockSize[0] >> 1) + (blockSize[0] * i) - 2 + 'px'
				tl.style.top = -2 + 'px'
			};
			for (var i = 0; i < bottomLetters.length; i++) {
				var bl = bottomLetters[i]
				bl.style.left = (blockSize[0] << 1) + (blockSize[0] >> 1) + (blockSize[0] * i) - 2 + 'px'
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
			for (var i = 0; i < leftStepTopLetters.length; i++) {
				var lstl = leftStepTopLetters[i]
				lstl.style.left = (blockSize[0] >> 1) + (blockSize[0] * i) - 2 + 'px'
				lstl.style.top = (blockSize[1] * 3) - 2 + 'px'
			};
			for (var i = 0; i < leftStepBottomLetters.length; i++) {
				var lsbl = leftStepBottomLetters[i]
				lsbl.style.left = (blockSize[0] * 2) - 8 + 'px'
				lsbl.style.top = windowH - (blockSize[1] >> 1) - 2 + 'px'
			};
			for (var i = 0; i < rightStepTopLetters.length; i++) {
				var rstl = rightStepTopLetters[i]
				rstl.style.left = windowW - (blockSize[0] << 1) + (blockSize[0] >> 1) + (blockSize[0] * i) - 2 + 'px'
				rstl.style.top = (blockSize[1] * 3) - 2 + 'px'
			};
			for (var i = 0; i < rightStepBottomLetters.length; i++) {
				var rsbl = rightStepBottomLetters[i]
				rsbl.style.left = (blockSize[0] * 5) + 2 + 'px'
				rsbl.style.top = windowH - (blockSize[1] >> 1) - 2 + 'px'
			};
		}
	} 

	return scope
}

export default aroundBorder