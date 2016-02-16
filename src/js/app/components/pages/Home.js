import Page from 'Page'
import AppStore from 'AppStore'
import Utils from 'Utils'
import bottomTexts from 'bottom-texts-home'
import AppConstants from 'AppConstants'
import grid from 'grid-home'
import aroundBorder from 'around-border-home'
import map from 'main-map'
import dom from 'dom-hand'

export default class Home extends Page {
	constructor(props) {
		var content = AppStore.pageContent()
		props.data.grid = []
		props.data.grid.length = 28
		props.data['lines-grid'] = { horizontal: [], vertical: [] }
		props.data['lines-grid'].horizontal.length = 3
		props.data['lines-grid'].vertical.length = 6
		props.data['text_a'] = content.texts['txt_a']
		props.data['a_vision'] = content.texts['a_vision']
		super(props)
		var bgUrl = this.getImageUrlById('background')
		this.props.data.bgurl = bgUrl

		this.triggerNewItem = this.triggerNewItem.bind(this)
		this.onItemEnded = this.onItemEnded.bind(this)
	}
	componentDidMount() {
		this.lastGridItemIndex;
		this.videoTriggerCounter = 200
		this.imageTriggerCounter = 0

		this.seats = [
			0, 1, 2, 3, 4, 5, 6,
			7, 8, 9, 10, 11, 12, 13,
			14, 15, 16, 17, 18, 19, 20,
			23, 24, 25
		]

		this.usedSeats = []

		this.bg = dom.select('.bg-wrapper', this.element)

		this.grid = grid(this.props, this.element, this.onItemEnded)
		// this.bottomTexts = bottomTexts(this.element)
		this.aroundBorder = aroundBorder(this.element)
		// this.map = map(this.element, AppConstants.INTERACTIVE)

		super.componentDidMount()
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
	update() {
		if(!this.transitionInCompleted) return
		this.videoTriggerCounter += 1
		if(this.videoTriggerCounter > 800) {
			this.videoTriggerCounter = 0
			this.triggerNewItem(AppConstants.ITEM_VIDEO)
		}
		this.imageTriggerCounter += 1
		if(this.imageTriggerCounter > 30) {
			this.imageTriggerCounter = 0
			this.triggerNewItem(AppConstants.ITEM_IMAGE)
		}
		super.update()
	}
	resize() {
		var windowW = AppStore.Window.w
		var windowH = AppStore.Window.h
		
		this.grid.resize()
		// this.bottomTexts.resize()
		this.aroundBorder.resize()
		// this.map.resize()

		var resizeVarsBg = Utils.ResizePositionProportionally(windowW, windowH, AppConstants.MEDIA_GLOBAL_W, AppConstants.MEDIA_GLOBAL_H)

		// bg
		this.bg.style.position = 'absolute'
		this.bg.style.width = resizeVarsBg.width + 'px'
		this.bg.style.height = resizeVarsBg.height + 'px'
		this.bg.style.top = resizeVarsBg.top + 'px'
		this.bg.style.left = resizeVarsBg.left + 'px'

		super.resize()
	}
	componentWillUnmount() {
		this.aroundBorder.clear()
		this.grid.clear()
		// this.map.clear()

		this.grid = null
		this.bottomTexts = null
		this.aroundBorder = null
		this.map = null

		super.componentWillUnmount()
	}
}

