import Page from 'Page'
import AppStore from 'AppStore'

export default class Home extends Page {
	constructor(props) {
		super(props)
		console.log(props)
	}
	componentDidMount() {
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
		super.resize()
	}
}

