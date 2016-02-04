import AppStore from 'AppStore'
import AppConstants from 'AppConstants'
import dom from 'dom-handler'

var bottomTexts = (parent)=> {

	var scope;
	var bottomTextsContainer = dom.select('.bottom-texts-container', parent)
	var leftBlock = dom.select('.left-text', bottomTextsContainer)
	var rightBlock = dom.select('.right-text', bottomTextsContainer)
	var leftFront = dom.select('.front-wrapper', leftBlock)
	var rightFront = dom.select('.front-wrapper', rightBlock)

	var resize = ()=> {
		var windowW = AppStore.Window.w
		var windowH = AppStore.Window.h

		var blockSize = [ windowW / AppConstants.GRID_ROWS, windowH / AppConstants.GRID_COLUMNS ]

		leftBlock.style.width = blockSize[0] * 2 + 'px'
		leftBlock.style.height = blockSize[1] + 'px'
		rightBlock.style.width = blockSize[0] * 2 + 'px'
		rightBlock.style.height = blockSize[1] + 'px'

		leftBlock.style.top = windowH - blockSize[1] + 'px'
		rightBlock.style.top = windowH - blockSize[1] + 'px'
		rightBlock.style.left = windowW - (blockSize[0] * 2) + 'px'

		setTimeout(()=>{
			leftFront.style.top = (blockSize[1] >> 1) - (leftFront.clientHeight >> 1) + 'px'
			rightFront.style.top = (blockSize[1] >> 1) - (rightFront.clientHeight >> 1) + 'px'
			rightFront.style.left = ((blockSize[0] << 1) >> 1) - (rightFront.clientWidth >> 1) + 'px'
		})

	}

	scope = {
		resize: resize
	}

	return scope
}

export default bottomTexts