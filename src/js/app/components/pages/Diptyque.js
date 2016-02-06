import Page from 'Page'
import AppStore from 'AppStore'
import diptyquePart from 'diptyque-part'
import character from 'character'
import ffText from 'fun-fact-text-holder'
import dom from 'dom-hand'
import arrowsWrapper from 'arrows-wrapper'

export default class Diptyque extends Page {
	constructor(props) {
		// var content = AppStore.globalContent()

		props.data['next-page'] = AppStore.getNextDiptyque()
		props.data['previous-page'] = AppStore.getPreviousDiptyque()

		super(props)

		this.onMouseMove = this.onMouseMove.bind(this)
		this.onClick = this.onClick.bind(this)
		this.onArrowMouseEnter = this.onArrowMouseEnter.bind(this)
		this.onArrowMouseLeave = this.onArrowMouseLeave.bind(this)
	}
	componentDidMount() {

		this.mouse = new PIXI.Point()
		this.mouse.nX = this.mouse.nY = 0

		this.leftPart = diptyquePart(
			this.pxContainer,
			this.getImageUrlById('shoe-bg'),
			
		)
		this.rightPart = diptyquePart(
			this.pxContainer,
			this.getImageUrlById('character-bg')
		)

		this.character = character(this.rightPart.holder, this.getImageUrlById('character'), this.getImageSizeById('character'))
		this.ffText = ffText(this.pxContainer)
		this.arrowsWrapper = arrowsWrapper(this.element, this.onArrowMouseEnter, this.onArrowMouseLeave)

		dom.event.on(window, 'mousemove', this.onMouseMove)
		dom.event.on(window, 'click', this.onClick)

		super.componentDidMount()
		this.domIsReady = true
	}
	setupAnimations() {
		var windowW = AppStore.Window.w
		var windowH = AppStore.Window.h

		this.tlIn.from(this.leftPart.holder, 1, { x: -windowW >> 1, ease:Expo.easeInOut }, 0)
		this.tlIn.from(this.leftPart.bgSprite, 1, { x: this.leftPart.bgSprite.x - 200, ease:Expo.easeOut }, 0.5)
		this.tlIn.from(this.leftPart.bgSprite.scale, 1, { x: 3, ease:Expo.easeOut }, 0.4)
		this.tlIn.from(this.rightPart.holder, 1, { x: windowW, ease:Expo.easeInOut }, 0)
		this.tlIn.from(this.rightPart.bgSprite, 1, { x: this.rightPart.bgSprite.x + 200, ease:Expo.easeOut }, 0.5)
		this.tlIn.from(this.rightPart.bgSprite.scale, 1, { x: 3, ease:Expo.easeOut }, 0.4)

		this.tlOut.to(this.leftPart.holder, 1, { x: -windowW >> 1, ease:Expo.easeInOut }, 0)
		this.tlOut.to(this.rightPart.holder, 1, { x: windowW, ease:Expo.easeInOut }, 0)

		super.setupAnimations()
	}
	onMouseMove(e) {
		e.preventDefault()
		var windowW = AppStore.Window.w
		var windowH = AppStore.Window.h
		this.mouse.x = e.clientX
		this.mouse.y = e.clientY
		this.mouse.nX = (e.clientX / windowW) * 1
		this.mouse.nY = (e.clientY / windowH) * 1

		// if(this.mouse.nX < 0.5) AppStore.Parent.style.cursor = 'pointer'
		// else AppStore.Parent.style.cursor = 'auto'

	}
	onClick(e) {
		if(this.mouse.nX < 0.5) {

			// if shoes are open
			if(this.ffText.isOpen) {

				this.ffText.close()
				
			}else{
				this.ffText.open()
			}

		}
	}
	onArrowMouseEnter(e) {
		e.preventDefault()
	}
	onArrowMouseLeave(e) {
		e.preventDefault()
	}
	update() {
		if(!this.domIsReady) return
		this.character.update(this.mouse)
		this.leftPart.update(this.mouse)
		this.rightPart.update(this.mouse)

		super.update()
	}
	resize() {
		var windowW = AppStore.Window.w
		var windowH = AppStore.Window.h

		this.leftPart.resize()
		this.rightPart.resize()
		this.character.resize()
		this.ffText.resize()
		this.arrowsWrapper.resize()

		this.rightPart.holder.x = (windowW >> 1)

		super.resize()
	}
	componentWillUnmount() {
		dom.event.off(window, 'mousemove', this.onMouseMove)
		dom.event.off(window, 'click', this.onClick)
		this.leftPart.clear()
		this.rightPart.clear()
		this.character.clear()
		this.ffText.clear()
		this.arrowsWrapper.clear()
		this.mouse = null
		this.leftPart = null
		this.rightPart = null
		this.character = null
		this.arrowsWrapper = null
		super.componentWillUnmount()
	}
}

