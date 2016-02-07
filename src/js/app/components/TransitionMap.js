import BaseComponent from 'BaseComponent'
import template from 'TransitionMap_hbs'
import AppStore from 'AppStore'
import AppConstants from 'AppConstants'
import AppActions from 'AppActions'
import Router from 'Router'
import map from 'main-map'
import {PagerStore, PagerConstants} from 'Pager'

class TransitionMap extends BaseComponent {
	constructor() {
		super()
		this.onPageTransitionOut = this.onPageTransitionOut.bind(this)
		this.onPageTransitionInComplete = this.onPageTransitionInComplete.bind(this)
		this.preloaderProgress = this.preloaderProgress.bind(this)
	}
	render(parent) {
		var scope = {}
		var generaInfos = AppStore.generalInfos()

		super.render('TransitionMap', parent, template, scope)
	}
	componentDidMount() {
		this.currentProgress = 0

		PagerStore.on(PagerConstants.PAGE_TRANSITION_OUT, this.onPageTransitionOut)
		PagerStore.on(PagerConstants.PAGE_TRANSITION_IN_COMPLETE, this.onPageTransitionInComplete)
		AppStore.Preloader.queue.on("progress", this.preloaderProgress, this)

		this.map = map(this.element, AppConstants.TRANSITION)

		super.componentDidMount()
	}
	onPageTransitionOut() {
		this.currentProgress = 0
		this.map.highlight(Router.getOldHash(), Router.getNewHash())
	}
	onPageTransitionInComplete() {
		var oldHash = Router.getOldHash()
		if(oldHash == undefined) return
		this.currentProgress = 0
		this.map.resetHighlight()
	}
	preloaderProgress(e) {
		this.currentProgress += 0.2
		if(e.progress > 0.99) this.currentProgress = 1
		this.currentProgress = this.currentProgress > 1 ? 1 : this.currentProgress 
		this.map.updateProgress(e.progress)
	}
	resize() {
		if(!this.domIsReady) return
		this.map.resize()
	}
}

export default TransitionMap


