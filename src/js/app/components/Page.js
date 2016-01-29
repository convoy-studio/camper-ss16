import BasePage from 'BasePage'
import AppStore from 'AppStore'
import AppConstants from 'AppConstants'
import AppActions from 'AppActions'
import PxHelper from 'PxHelper'

export default class Page extends BasePage {
	constructor(props) {
		super(props)
	}
	componentWillMount() {
		super.componentWillMount()
	}
	componentDidMount() {
		this.pxContainer = new PIXI.Container()
		setTimeout(()=>{ AppActions.pxAddChild(this.pxContainer) }, 0)
		super.componentDidMount()
	}
	didTransitionOutComplete() {
		super.didTransitionOutComplete()
	}
	setupAnimations() {
		super.setupAnimations()
	}
	getImageUrlById(id) {
		var url = this.props.hash.type == AppConstants.HOME ? 'home-' + id : this.props.hash.parent + '-' + this.props.hash.target + '-' + id
		return AppStore.Preloader.getImageURL(url)
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
