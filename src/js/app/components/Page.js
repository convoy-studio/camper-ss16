import BasePage from 'BasePage'
import AppStore from 'AppStore'
import AppConstants from 'AppConstants'
import AppActions from 'AppActions'
import PxHelper from 'PxHelper'
import dom from 'dom-hand'

export default class Page extends BasePage {
	constructor(props) {
		super(props)
		this.transitionInCompleted = false
	}
	componentWillMount() {
		this.pxContainer = new PIXI.Container()
		super.componentWillMount()
	}
	componentDidMount() {
		setTimeout(()=>{ AppActions.pxAddChild(this.pxContainer) }, 0)
		super.componentDidMount()
	}
	willTransitionIn() {
		if(this.props.hash.type == AppConstants.HOME) {
			AppStore.Canvas.style['z-index'] = 1
		}else{
			AppStore.Canvas.style['z-index'] = 4
		}
		super.willTransitionIn()
	}
	willTransitionOut() {
		setTimeout(()=> {
			AppStore.Canvas.style['z-index'] = 4
		}, 500)
		super.willTransitionOut()
	}
	didTransitionInComplete() {
		if(this.props.hash.type == AppConstants.HOME) {
			this.transitionInCompleted = true
			AppStore.Canvas.style['z-index'] = 0
		}else{
			AppStore.Canvas.style['z-index'] = 1
		}
		super.didTransitionInComplete()
	}
	setupAnimations() {
		super.setupAnimations()
	}
	getImageUrlById(id) {
		var url = this.props.hash.type == AppConstants.HOME ? 'home-' + id : this.props.hash.parent + '-' + this.props.hash.target + '-' + id
		return AppStore.Preloader.getImageURL(url)
	}
	getImageSizeById(id) {
		var url = this.props.hash.type == AppConstants.HOME ? 'home-' + id : this.props.hash.parent + '-' + this.props.hash.target + '-' + id
		return AppStore.Preloader.getImageSize(url)
	}
	resize() {
		super.resize()
	}
	update() {
	}
	componentWillUnmount() {
		PxHelper.removeChildrenFromContainer(this.pxContainer)
		setTimeout(()=>{ AppActions.pxRemoveChild(this.pxContainer) }, 0)
		super.componentWillUnmount()
	}
}
