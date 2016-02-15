import Page from 'Page'
import AppStore from 'AppStore'
import diptyquePart from 'diptyque-part'
import character from 'character'
import funFact from 'fun-fact-holder'
import dom from 'dom-hand'
import arrowsWrapper from 'arrows-wrapper'
import AppConstants from 'AppConstants'
import selfieStick from 'selfie-stick'

export default class Diptyque extends Page {
	constructor(props) {

		var nextDiptyque = AppStore.getNextDiptyque()
		var previousDiptyque = AppStore.getPreviousDiptyque()
		props.data['next-page'] = nextDiptyque
		props.data['previous-page'] = previousDiptyque
		props.data['next-preview-url'] = AppStore.getPreviewUrlByHash(nextDiptyque)
		props.data['previous-preview-url'] = AppStore.getPreviewUrlByHash(previousDiptyque)
		props.data['fact-txt'] = props.data.fact[AppStore.lang()]

		super(props)

		this.onMouseMove = this.onMouseMove.bind(this)
		this.onClick = this.onClick.bind(this)
		this.onArrowMouseEnter = this.onArrowMouseEnter.bind(this)
		this.onArrowMouseLeave = this.onArrowMouseLeave.bind(this)
		this.onCharacterMouseOver = this.onCharacterMouseOver.bind(this)
		this.onCharacterMouseOut = this.onCharacterMouseOut.bind(this)
		this.onCharacterClicked = this.onCharacterClicked.bind(this)
		this.onSelfieStickClicked = this.onSelfieStickClicked.bind(this)
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

		this.character = character(this.rightPart.holder, this.getImageUrlById('character'), this.getImageSizeById('character'), this.onCharacterMouseOver, this.onCharacterMouseOut, this.onCharacterClicked)
		this.funFact = funFact(this.pxContainer, this.element, this.mouse, this.props.data)
		this.arrowsWrapper = arrowsWrapper(this.element, this.onArrowMouseEnter, this.onArrowMouseLeave)
		this.selfieStick = selfieStick(this.element, this.mouse, this.props.data)

		dom.event.on(this.selfieStick.el, 'click', this.onSelfieStickClicked)

		dom.event.on(window, 'mousemove', this.onMouseMove)
		dom.event.on(window, 'click', this.onClick)

		TweenMax.set(this.arrowsWrapper.background('left'), { x:-AppConstants.SIDE_EVENT_PADDING })
		TweenMax.set(this.arrowsWrapper.background('right'), { x:AppConstants.SIDE_EVENT_PADDING })

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

		// if(this.mouse.nX > 0.5) AppStore.Parent.style.cursor = 'pointer'
		// else AppStore.Parent.style.cursor = 'auto'

	}
	onClick(e) {

	}
	onCharacterMouseOver() {
		// console.log('over')
	}
	onCharacterMouseOut() {
		// console.log('out')
	}
	onCharacterClicked() {
		if(this.funFact.isOpen) {
			this.funFact.close()
		}else{
			this.funFact.open()
		}
	}
	onSelfieStickClicked(e) {
		e.preventDefault()
		if(this.selfieStick.isOpened) {
			this.selfieStick.close()
		}else{
			this.selfieStick.open()
		}
	}
	onArrowMouseEnter(e) {
		e.preventDefault()
		var id = e.currentTarget.id

		var posX;
		var offsetX = AppConstants.SIDE_EVENT_PADDING
		if(id == 'left') posX = offsetX
		else posX = -offsetX

		TweenMax.to(this.pxContainer, 0.4, { x:posX, ease:Back.easeOut, force3D:true })
		TweenMax.to(this.arrowsWrapper.background(id), 0.4, { x:0, ease:Back.easeOut, force3D:true })

		this.arrowsWrapper.over(id)
	}
	onArrowMouseLeave(e) {
		e.preventDefault()
		var id = e.currentTarget.id

		var posX;
		var offsetX = AppConstants.SIDE_EVENT_PADDING
		if(id == 'left') posX = -offsetX
		else posX = offsetX

		TweenMax.to(this.pxContainer, 0.6, { x:0, ease:Expo.easeOut })
		TweenMax.to(this.arrowsWrapper.background(id), 0.6, { x:posX, ease:Expo.easeOut })

		this.arrowsWrapper.out(id)
	}
	update() {
		if(!this.domIsReady) return
		this.character.update(this.mouse)
		this.leftPart.update(this.mouse)
		this.rightPart.update(this.mouse)
		this.selfieStick.update()
		this.funFact.update()

		super.update()
	}
	resize() {
		var windowW = AppStore.Window.w
		var windowH = AppStore.Window.h

		this.leftPart.resize()
		this.rightPart.resize()
		this.character.resize()
		this.funFact.resize()
		this.arrowsWrapper.resize()
		this.selfieStick.resize()

		this.rightPart.holder.x = (windowW >> 1)

		super.resize()
	}
	componentWillUnmount() {
		dom.event.off(window, 'mousemove', this.onMouseMove)
		dom.event.off(window, 'click', this.onClick)
		dom.event.off(this.selfieStick.el, 'click', this.onSelfieStickClicked)
		this.leftPart.clear()
		this.rightPart.clear()
		this.character.clear()
		this.funFact.clear()
		this.selfieStick.clear()
		this.arrowsWrapper.clear()
		this.mouse = null
		this.leftPart = null
		this.rightPart = null
		this.character = null
		this.arrowsWrapper = null
		super.componentWillUnmount()
	}
}

