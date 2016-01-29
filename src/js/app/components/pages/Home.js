import Page from 'Page'
import AppStore from 'AppStore'
import Utils from 'Utils'
import videoCanvas from 'video-canvas'

export default class Home extends Page {
	constructor(props) {
		props.data.grid = []
		props.data.grid.length = 28
		super(props)
	}
	componentDidMount() {
		// console.log(this.getImageUrlById('hello'))

		var $gridContainer = this.element.find(".grid-container")
		// var gridChildren = $gridContainer.children().get()
		
		// this.grid = {
		// 	el: $gridContainer,
		// 	items: gridChildren,
		// 	num: gridChildren.length,
		// 	positions: []
		// } 



		// this.grid = {
		// 	el: $gridContainer,
		// 	items: [],
		// 	num: this.props.data.grid.length,
		// 	positions: []
		// } 
		// for (var i = 0; i < this.props.data.grid.length; i++) {
		// 	var texture = PIXI.Texture.fromVideo('http://embed.wistia.com/deliveries/840a3f6729b1f52f446aae6daec939a3eca4c0c1/arelluf-capas.mp4');
		// 	var videoSprite = new PIXI.Sprite(texture);
		// 	this.grid.items[i] = videoSprite
		// 	this.grid.items[i]._texture.baseTexture.source.setAttribute('autoplay', 0)
		// 	// console.log(this.grid.items[i]._texture.baseTexture.source)

		// 	texture.baseTexture.on('loaded', (tex)=> {
		// 		// pauseVideo(video.baseTexture.source)
		// 		tex.source.pause()
		// 		// console.log(e)
		// 	})

		// 	this.pxContainer.addChild(videoSprite);
		// };

		// this.grid.items[3]._texture.baseTexture.source.play()
		// setInterval(()=>{
		// 	var randNum = Utils.Rand(0, this.grid.num-1, 0)
		// 	this.grid.items[randNum]._texture.baseTexture.source.pause()
		// 	this.grid.items[randNum]._texture.baseTexture.source.currentTime = 0
		// 	this.grid.items[randNum]._texture.baseTexture.source.play()
		// }, 10000)


		// small canvases
		this.grid = {
			el: $gridContainer,
			items: [],
			num: this.props.data.grid.length,
			positions: []
		} 
		for (var i = 0; i < this.props.data.grid.length; i++) {
			var player = videoCanvas('http://embed.wistia.com/deliveries/840a3f6729b1f52f446aae6daec939a3eca4c0c1/arelluf-capas.mp4', $gridContainer.get(0)).volume(0.5)
			this.grid.items[i] = player
		}

		this.grid.items[3].element().play()
		setInterval(()=>{
			var randNum = Utils.Rand(0, this.grid.num-1, 0)
			this.grid.items[randNum].element().pause()
			this.grid.items[randNum].element().currentTime = 0
			this.grid.items[randNum].element().play()
		}, 5000)


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

			// item.width = blockSize[ 0 ]
			// item.height = blockSize[ 1 ]
			// item.x = pos[ 0 ]
			// item.y = pos[ 1 ]

			// item.style.position = 'absolute'
			// item.style.width = blockSize[ 0 ] + 'px'
			// item.style.height = blockSize[ 1 ] + 'px'
			// item.style.backgroundColor = Utils.RandomColor()
			// item.style.left = pos[ 0 ] + 'px'
			// item.style.top = pos[ 1 ] + 'px'

			var c = item.canvas()
			c.style.position = 'absolute'
			c.style.width = blockSize[ 0 ] + 'px'
			c.style.height = blockSize[ 1 ] + 'px'
			c.style.left = pos[ 0 ] + 'px'
			c.style.top = pos[ 1 ] + 'px'
			
			// positions
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

