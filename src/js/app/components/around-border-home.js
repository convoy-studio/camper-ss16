import AppStore from 'AppStore'
import AppConstants from 'AppConstants'

var aroundBorder = (parent)=> {

	var scope;

	var $container = parent.find('.around-border-container')
	var top = $container.find('.top').get(0)
	var bottom = $container.find('.bottom').get(0)
	var left = $container.find('.left').get(0)
	var right = $container.find('.right').get(0)
	var leftStepTop = $container.find('.left-step-top').get(0)
	var leftStepBottom = $container.find('.left-step-bottom').get(0)
	var rightStepTop = $container.find('.right-step-top').get(0)
	var rightStepBottom = $container.find('.right-step-bottom').get(0)

	var $lettersContainer = parent.find(".around-border-letters-container")
	var topLetters = $lettersContainer.find(".top").children().get()
	var bottomLetters = $lettersContainer.find(".bottom").children().get()
	var leftLetters = $lettersContainer.find(".left").children().get()
	var rightLetters = $lettersContainer.find(".right").children().get()
	var leftStepTopLetters = $lettersContainer.find('.left-step-top').children().get()
	var leftStepBottomLetters = $lettersContainer.find('.left-step-bottom').children().get()
	var rightStepTopLetters = $lettersContainer.find('.right-step-top').children().get()
	var rightStepBottomLetters = $lettersContainer.find('.right-step-bottom').children().get()

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
			};
			for (var i = 0; i < bottomLetters.length; i++) {
				var bl = bottomLetters[i]
				bl.style.left = (blockSize[0] << 1) + (blockSize[0] >> 1) + (blockSize[0] * i) - 2 + 'px'
				bl.style.top = windowH - 10 + 'px'
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
				lstl.style.top = (blockSize[1] * 3) + 'px'
			};
			for (var i = 0; i < leftStepBottomLetters.length; i++) {
				var lsbl = leftStepBottomLetters[i]
				lsbl.style.left = (blockSize[0] * 2) - 8 + 'px'
				lsbl.style.top = windowH - (blockSize[1] >> 1) - 2 + 'px'
			};
			for (var i = 0; i < rightStepTopLetters.length; i++) {
				var rstl = rightStepTopLetters[i]
				rstl.style.left = windowW - (blockSize[0] << 1) + (blockSize[0] >> 1) + (blockSize[0] * i) - 2 + 'px'
				rstl.style.top = (blockSize[1] * 3) + 'px'
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