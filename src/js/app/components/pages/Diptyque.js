import Page from 'Page'
import AppStore from 'AppStore'
import diptyquePart from 'diptyque-part'
import character from 'character'
import funFact from 'fun-fact-holder'
import dom from 'dom-hand'
import arrowsWrapper from 'arrows-wrapper'
import AppConstants from 'AppConstants'
import AppActions from 'AppActions'
import selfieStick from 'selfie-stick'
import mainBtns from 'main-diptyque-btns'

export default class Diptyque extends Page {
	constructor(props) {

		var nextDiptyque = AppStore.getNextDiptyque()
		var previousDiptyque = AppStore.getPreviousDiptyque()
		props.data['next-page'] = nextDiptyque
		props.data['previous-page'] = previousDiptyque
		props.data['next-preview-url'] = AppStore.getPreviewUrlByHash(nextDiptyque)
		props.data['previous-preview-url'] = AppStore.getPreviewUrlByHash(previousDiptyque)
		props.data['fact-txt'] = props.data.fact['en']

		super(props)

		this.onMouseMove = this.onMouseMove.bind(this)
		this.onArrowMouseEnter = this.onArrowMouseEnter.bind(this)
		this.onArrowMouseLeave = this.onArrowMouseLeave.bind(this)
		this.onSelfieStickClicked = this.onSelfieStickClicked.bind(this)
		this.onMainBtnsEventHandler = this.onMainBtnsEventHandler.bind(this)
		this.onOpenFact = this.onOpenFact.bind(this)
		this.onCloseFact = this.onCloseFact.bind(this)
		this.uiTransitionInCompleted = this.uiTransitionInCompleted.bind(this)

		this.transitionInCompleted = false
	}
	componentDidMount() {

		AppStore.on(AppConstants.OPEN_FUN_FACT, this.onOpenFact)
		AppStore.on(AppConstants.CLOSE_FUN_FACT, this.onCloseFact)

		this.uiInTl = new TimelineMax()

		this.mouse = new PIXI.Point()
		this.mouse.nX = this.mouse.nY = 0

		this.leftPart = diptyquePart(
			this.pxContainer,
			this.getImageUrlById('shoe-bg')
		)
		this.rightPart = diptyquePart(
			this.pxContainer,
			this.getImageUrlById('character-bg')
		)

		var imgExt = AppStore.getImageDeviceExtension()

		this.character = character(this.rightPart.holder, this.getImageUrlById('character'+imgExt), this.getImageSizeById('character'+imgExt))
		this.funFact = funFact(this.pxContainer, this.element, this.mouse, this.props.data, this.props)
		this.arrowsWrapper = arrowsWrapper(this.element, this.onArrowMouseEnter, this.onArrowMouseLeave)
		this.selfieStick = selfieStick(this.element, this.mouse, this.props.data)
		this.mainBtns = mainBtns(this.element, this.props.data, this.mouse, this.onMainBtnsEventHandler)

		dom.event.on(this.selfieStick.el, 'click', this.onSelfieStickClicked)
		dom.event.on(window, 'mousemove', this.onMouseMove)

		TweenMax.set(this.arrowsWrapper.background('left'), { x:-AppConstants.SIDE_EVENT_PADDING })
		TweenMax.set(this.arrowsWrapper.background('right'), { x:AppConstants.SIDE_EVENT_PADDING })

		super.componentDidMount()
		this.domIsReady = true
	}
	setupAnimations() {
		this.updateTimelines()
		super.setupAnimations()
	}
	updateTimelines() {
		var windowW = AppStore.Window.w
		var windowH = AppStore.Window.h

		this.tlIn.from(this.leftPart.holder, 1, { x: -windowW >> 1, ease:Expo.easeInOut, force3D:true }, 0)
		this.tlIn.from(this.leftPart.bgSprite, 1, { x: this.leftPart.bgSprite.x - 200, ease:Expo.easeOut, force3D:true }, 0.5)
		this.tlIn.from(this.leftPart.bgSprite.scale, 1, { x: 3, ease:Expo.easeOut, force3D:true }, 0.4)
		this.tlIn.from(this.rightPart.holder, 1, { x: windowW, ease:Expo.easeInOut, force3D:true }, 0)
		this.tlIn.from(this.rightPart.bgSprite, 1, { x: this.rightPart.bgSprite.x + 200, ease:Expo.easeOut, force3D:true }, 0.5)
		this.tlIn.from(this.rightPart.bgSprite.scale, 1, { x: 3, ease:Expo.easeOut, force3D:true }, 0.4)

		this.tlOut.to(this.arrowsWrapper.left, 0.5, { x: -100, ease:Back.easeOut, force3D:true }, 0)
		this.tlOut.to(this.arrowsWrapper.right, 0.5, { x: 100, ease:Back.easeOut, force3D:true }, 0)
		this.tlOut.to(this.selfieStick.el, 0.5, { y: 500, ease:Back.easeOut, force3D:true }, 0)
		this.tlOut.to(this.leftPart.holder, 1, { x: -windowW >> 1, ease:Expo.easeInOut, force3D:true }, 0.1)
		this.tlOut.to(this.rightPart.holder, 1, { x: windowW, ease:Expo.easeInOut, force3D:true }, 0.1)
		
		this.uiInTl.from(this.arrowsWrapper.left, 1, { x: -100, ease:Expo.easeOut, force3D:true }, 0.1)
		this.uiInTl.from(this.arrowsWrapper.right, 1, { x: 100, ease:Expo.easeOut, force3D:true }, 0.1)
		this.uiInTl.from(this.selfieStick.el, 1, { y: 500, ease:Back.easeOut, force3D:true }, 0.5)
		this.uiInTl.pause(0)
		this.uiInTl.eventCallback("onComplete", this.uiTransitionInCompleted);
	}
	uiTransitionInCompleted() {
		this.uiInTl.eventCallback("onComplete", null)
		this.selfieStick.transitionInCompleted()
	}
	didTransitionInComplete() {
		this.transitionInCompleted = true
		this.uiInTl.timeScale(1.6).play()		
		super.didTransitionInComplete()
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
	onSelfieStickClicked(e) {
		e.preventDefault()
		if(this.selfieStick.isOpened) {
			this.selfieStick.close()
		}else{
			this.selfieStick.open()
			this.mainBtns.activate()
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
	onMainBtnsEventHandler(e) {
		e.preventDefault()
		var type = e.type
		var target = e.currentTarget
		var id = target.id
		if(type == 'click' && id == 'fun-fact-btn') {
			if(this.funFact.isOpen) {
				AppActions.closeFunFact()
			}else{
				AppActions.openFunFact()
			}
			return
		}
		if(type == 'mouseenter') {
			this.mainBtns.over(id)
			return
		}
		if(type == 'mouseleave') {
			this.mainBtns.out(id)
			return
		}
		if(type == 'click' && id == 'shop-btn') {
			window.open(this.props.data['shop-url'], '_blank')
			return
		}
	}
	onOpenFact(){
		this.funFact.open()
		this.mainBtns.disactivate()
	}
	onCloseFact(){
		this.funFact.close()
		this.mainBtns.activate()
	}
	update() {
		if(!this.domIsReady) return
		this.character.update(this.mouse)
		this.leftPart.update(this.mouse)
		this.rightPart.update(this.mouse)
		this.selfieStick.update()
		this.funFact.update()
		this.mainBtns.update()

		super.update()
	}
	resize() {
		var windowW = AppStore.Window.w
		var windowH = AppStore.Window.h

		if(this.transitionInCompleted) {
			this.tlIn.clear()
			this.tlOut.clear()
			this.uiInTl.eventCallback("onComplete", null)
			this.updateTimelines()
			this.tlOut.pause(0)
			this.tlIn.pause(this.tlIn.totalDuration())
			this.uiInTl.pause(this.uiInTl.totalDuration())
		}

		this.leftPart.resize()
		this.rightPart.resize()
		this.character.resize()
		this.funFact.resize()
		this.arrowsWrapper.resize()
		this.selfieStick.resize()
		this.mainBtns.resize()

		this.rightPart.holder.x = (windowW >> 1)

		super.resize()
	}
	componentWillUnmount() {
		AppStore.off(AppConstants.OPEN_FUN_FACT, this.onOpenFact)
		AppStore.off(AppConstants.CLOSE_FUN_FACT, this.onCloseFact)
		dom.event.off(window, 'mousemove', this.onMouseMove)
		dom.event.off(this.selfieStick.el, 'click', this.onSelfieStickClicked)
		this.uiInTl.eventCallback("onComplete", null)
		this.uiInTl.clear()
		this.leftPart.clear()
		this.rightPart.clear()
		this.character.clear()
		this.funFact.clear()
		this.selfieStick.clear()
		this.arrowsWrapper.clear()
		this.mainBtns.clear()
		this.uiInTl = null
		this.mouse = null
		this.leftPart = null
		this.rightPart = null
		this.character = null
		this.arrowsWrapper = null
		this.mainBtns = null
		super.componentWillUnmount()
	}
}

