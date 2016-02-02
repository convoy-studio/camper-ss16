import Page from 'Page'
import AppStore from 'AppStore'
import diptyquePart from 'diptyque-part'

export default class Diptyque extends Page {
	constructor(props) {
		super(props)
	}
	componentDidMount() {

		this.leftPart = diptyquePart(
			this.pxContainer,
			this.getImageUrlById('shoe-bg')
		)
		this.rightPart = diptyquePart(
			this.pxContainer,
			this.getImageUrlById('character-bg')
		)

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

		this.leftPart.resize()
		this.rightPart.resize()

		this.rightPart.holder.x = windowW >> 1

		super.resize()
	}
}

