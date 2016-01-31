import AppStore from 'AppStore'
import AppConstants from 'AppConstants'

var bottomTexts = (parent)=> {

	var scope;
	var bottomTextsContainer = parent.find(".bottom-texts-container")
	var leftBottomText = bottomTextsContainer.find('.left-text')
	var rightBottomText = bottomTextsContainer.find('.right-text')

	var resize = ()=> {
		var windowW = AppStore.Window.w
		var windowH = AppStore.Window.h

		var blockSize = [ windowW / AppConstants.GRID_ROWS, windowH / AppConstants.GRID_COLUMNS ]

		scope.left.el.style.width = blockSize[0] * 2 + 'px'
		scope.left.el.style.height = blockSize[1] + 'px'
		scope.right.el.style.width = blockSize[0] * 2 + 'px'
		scope.right.el.style.height = blockSize[1] + 'px'

		scope.left.el.style.top = windowH - blockSize[1] + 'px'
		scope.right.el.style.top = windowH - blockSize[1] + 'px'
		scope.right.el.style.left = windowW - (blockSize[0] * 2) + 'px'
	}

	scope = {
		left: {
			el: leftBottomText.get(0),
			front: leftBottomText.find('.front-wrapper').get(0),
			background: leftBottomText.find('.background').get(0)
		},
		right: {
			el: rightBottomText.get(0),
			front: rightBottomText.find('.front-wrapper').get(0),
			background: rightBottomText.find('.background').get(0)
		},
		resize: resize
	}

	return scope
}

export default bottomTexts