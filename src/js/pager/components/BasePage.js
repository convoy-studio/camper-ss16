import BaseComponent from 'BaseComponent'

export default class BasePage extends BaseComponent {
	constructor(props) {
		super()
		this.props = props
		this.didTransitionInComplete = this.didTransitionInComplete.bind(this)
		this.didTransitionOutComplete = this.didTransitionOutComplete.bind(this)
		this.tlIn = new TimelineMax()
		this.tlOut = new TimelineMax()
	}
	componentDidMount() {
		this.resize()
		this.setupAnimations()
		setTimeout(() => this.props.isReady(this.props.hash), 0)
	}
	setupAnimations() {
		// reset
		this.tlIn.pause(0)
		this.tlOut.pause(0)
	}
	willTransitionIn() {
		this.tlIn.eventCallback("onComplete", this.didTransitionInComplete)
		this.tlIn.timeScale(1.8)
		setTimeout(()=>this.tlIn.play(0), 0)
	}
	willTransitionOut() {
		if(this.tlOut.getChildren().length < 1) {
			this.didTransitionOutComplete()
		}else{
			this.tlOut.eventCallback("onComplete", this.didTransitionOutComplete)
			this.tlOut.timeScale(1.8)
			setTimeout(()=>this.tlOut.play(0), 500)
		}
	}
	didTransitionInComplete() {
		this.tlIn.eventCallback("onComplete", null)
		setTimeout(() => this.props.didTransitionInComplete(), 0)
	}
	didTransitionOutComplete() {
		this.tlOut.eventCallback("onComplete", null)
		setTimeout(() => this.props.didTransitionOutComplete(), 0)
	}
	resize() {
	}
	forceUnmount() {
		this.tlIn.pause(0)
		this.tlOut.pause(0)
		this.didTransitionOutComplete()
	}
	componentWillUnmount() {
		this.tlIn.clear()
		this.tlOut.clear()
	}
}
