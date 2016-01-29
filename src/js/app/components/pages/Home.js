import Page from 'Page'
import AppStore from 'AppStore'
import Utils from 'Utils'

export default class Home extends Page {
	constructor(props) {
		props.data.grid = []
		props.data.grid.length = 28
		super(props)
	}
	componentDidMount() {
		// console.log(this.getImageUrlById('hello'))

		var $gridContainer = this.element.find(".grid-container")
		var gridChildren = $gridContainer.children().get()
		this.grid = {
			el: $gridContainer,
			items: gridChildren,
			num: gridChildren.length,
			positions: []
		}

		super.componentDidMount()
	}
	didTransitionInComplete() {
		super.didTransitionInComplete()
	}
	didTransitionOutComplete() {
		super.didTransitionOutComplete()
	}
	resize() {
		var windowW = AppStore.Window.w
		var windowH = AppStore.Window.h

		var blockSize = [ windowW / 7, windowH / 4 ]
		var pos = [ 0, 0 ]
		for (var i = 0; i < this.grid.num; i++) {
			var item = this.grid.items[i]
			item.style.position = 'absolute'
			item.style.width = blockSize[ 0 ] + 'px'
			item.style.height = blockSize[ 1 ] + 'px'
			item.style.backgroundColor = Utils.RandomColor()
			item.style.left = pos[ 0 ] + 'px'
			item.style.top = pos[ 1 ] + 'px'
			this.grid.positions[ i ] = [ pos[ 0 ], pos[ 1 ] ]

			pos[ 0 ] += blockSize[ 0 ]
			if( pos[ 0 ] > windowW - (blockSize[ 0 ] >> 1) ) {
				pos[ 1 ] += blockSize[ 1 ]
				pos[ 0 ] = 0
			}
		};

		super.resize()
	}
}

