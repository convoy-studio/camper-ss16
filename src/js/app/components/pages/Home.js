import Page from 'Page'
import AppStore from 'AppStore'
import Utils from 'Utils'
import bottomTexts from 'bottom-texts-home'
import AppConstants from 'AppConstants'
import grid from 'grid-home'
import imageCanvasesGrid from 'image-to-canvases-grid'
import aroundBorder from 'around-border-home'
import map from 'main-map'
import dom from 'dom-hand'
import gridPositions from 'grid-positions'

export default class Home extends Page {
	constructor(props) {
		var content = AppStore.pageContent()
		var generaInfos = AppStore.generalInfos()
		var texts = content.texts[AppStore.lang()]
		props.data.facebookUrl = generaInfos['facebook_url']
		props.data.twitterUrl = generaInfos['twitter_url']
		props.data.instagramUrl = generaInfos['instagram_url']
		props.data.grid = []
		props.data.grid.length = 28
		props.data['lines-grid'] = { horizontal: [], vertical: [] }
		props.data['lines-grid'].horizontal.length = 3
		props.data['lines-grid'].vertical.length = 6
		props.data['generic'] = texts.generic
		props.data['deia-txt'] = texts['deia']
		props.data['arelluf-txt'] = texts['arelluf']
		props.data['es-trenc-txt'] = texts['es-trenc']

		super(props)
		var bgUrl = this.getImageUrlById('background')
		this.props.data.bgurl = bgUrl

		this.triggerNewItem = this.triggerNewItem.bind(this)
		this.onItemEnded = this.onItemEnded.bind(this)
		this.onMouseMove = this.onMouseMove.bind(this)
	}
	componentDidMount() {
		this.lastGridItemIndex;
		this.videoTriggerCounter = 200
		this.imageTriggerCounter = 0

		this.mouse = new PIXI.Point()
		this.mouse.nX = this.mouse.nY = 0

		this.seats = [
			1, 3, 5,
			7, 9, 11,
			15, 17,
			21, 23, 25
		]

		this.usedSeats = []

		this.imgCGrid = imageCanvasesGrid(this.element)
		this.imgCGrid.load(this.props.data.bgurl)
		this.grid = grid(this.props, this.element, this.onItemEnded)
		this.grid.init()
		this.bottomTexts = bottomTexts(this.element)
		this.aroundBorder = aroundBorder(this.element)
		this.map = map(this.element, AppConstants.INTERACTIVE)

		dom.event.on(window, 'mousemove', this.onMouseMove)

		super.componentDidMount()
	}
	setupAnimations() {
		var windowW = AppStore.Window.w

		this.tlIn.from(this.aroundBorder.el, 1, { opacity:0, ease:Expo.easeInOut }, 0)
		this.tlIn.from(this.aroundBorder.letters, 1, { opacity:0, ease:Expo.easeInOut }, 0)
		this.tlIn.from(this.imgCGrid.el, 1, { opacity:0, ease:Expo.easeInOut }, 0)
		this.tlIn.staggerFrom(this.grid.children, 1, { opacity:0, ease:Expo.easeInOut }, 0.01, 0.1)
		this.tlIn.staggerFrom(this.grid.lines.horizontal, 1, { opacity:0, ease:Expo.easeInOut }, 0.01, 0.2)
		this.tlIn.staggerFrom(this.grid.lines.vertical, 1, { opacity:0, ease:Expo.easeInOut }, 0.01, 0.2)
		this.tlIn.from(this.bottomTexts.el, 1, { x:windowW * 0.4, ease:Expo.easeInOut, force3D:true }, 0.4)

		super.setupAnimations()
	}
	didTransitionInComplete() {
		this.bottomTexts.openTxtById('generic')
		super.didTransitionInComplete()
	}
	triggerNewItem(type) {
		var index = this.seats[Utils.Rand(0, this.seats.length - 1, 0)]
		for (var i = 0; i < this.usedSeats.length; i++) {
			var seat = this.usedSeats[i]
			if(seat == index) {
				if(this.usedSeats.length < this.seats.length - 2) this.triggerNewItem(type)
				return
			}
		};
		this.usedSeats.push(index)
		this.grid.transitionInItem(index, type)
	}
	onItemEnded(item) {
		for (var i = 0; i < this.usedSeats.length; i++) {
			var usedSeat = this.usedSeats[i]
			if(usedSeat == item.seat) {
				this.usedSeats.splice(i, 1)
			}
		};
	}
	onMouseMove(e) {
		e.preventDefault()
		var windowW = AppStore.Window.w
		var windowH = AppStore.Window.h
		this.mouse.x = e.clientX
		this.mouse.y = e.clientY
		this.mouse.nX = (e.clientX / windowW) * 1
		this.mouse.nY = (e.clientY / windowH) * 1
	}
	update() {
		if(!this.transitionInCompleted) return
		// this.videoTriggerCounter += 1
		// if(this.videoTriggerCounter > 800) {
		// 	this.videoTriggerCounter = 0
		// 	this.triggerNewItem(AppConstants.ITEM_VIDEO)
		// }
		// this.imageTriggerCounter += 1
		// if(this.imageTriggerCounter > 30) {
		// 	this.imageTriggerCounter = 0
		// 	this.triggerNewItem(AppConstants.ITEM_IMAGE)
		// }
		this.imgCGrid.update(this.mouse)
		super.update()
	}
	resize() {
		var windowW = AppStore.Window.w
		var windowH = AppStore.Window.h
		
		var gGrid = gridPositions(windowW, windowH, AppConstants.GRID_COLUMNS, AppConstants.GRID_ROWS, 'cols_rows')

		this.grid.resize(gGrid)
		this.imgCGrid.resize(gGrid)
		this.bottomTexts.resize()
		this.aroundBorder.resize()
		this.map.resize()

		var resizeVarsBg = Utils.ResizePositionProportionally(windowW, windowH, AppConstants.MEDIA_GLOBAL_W, AppConstants.MEDIA_GLOBAL_H)

		super.resize()
	}
	componentWillUnmount() {
		dom.event.off(window, 'mousemove', this.onMouseMove)

		this.aroundBorder.clear()
		this.grid.clear()
		this.map.clear()
		this.bottomTexts.clear()

		this.grid = null
		this.bottomTexts = null
		this.aroundBorder = null
		this.map = null

		super.componentWillUnmount()
	}
}

