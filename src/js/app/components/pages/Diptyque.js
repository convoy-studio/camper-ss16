import Page from 'Page'
import AppStore from 'AppStore'
import diptyquePart from 'diptyque-part'
import character from 'character'
import shoe from 'main-shoe'
import shoesHolder from 'shoes-holder'

export default class Diptyque extends Page {
	constructor(props) {
		super(props)

		this.onMouseMove = this.onMouseMove.bind(this)
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
		this.shoe = shoe(this.leftPart.holder, this.getImageUrlById('shoe'), this.getImageSizeById('shoe'))
		this.shoesHolder = shoesHolder(this.pxContainer)

		window.addEventListener('mousemove', this.onMouseMove)

		setTimeout(()=>this.shoesHolder.open(), 2000)

		super.componentDidMount()
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
	willTransitionIn() {
		AppStore.Canvas.style['z-index'] = 4
		super.willTransitionIn()
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
		this.character.update(this.mouse)
		this.shoe.update(this.mouse)
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
		this.shoe.resize()
		this.shoesHolder.resize()

		this.rightPart.holder.x = (windowW >> 1)

		super.resize()
	}
	componentWillUnmount() {
		this.leftPart.clear()
		this.rightPart.clear()
		super.componentWillUnmount()
	}
}

