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
		this.onPageTransitionOutComplete = this.onPageTransitionOutComplete.bind(this)
	}
	render(parent) {
		var scope = {}
		var generaInfos = AppStore.generalInfos()

		super.render('TransitionMap', parent, template, scope)
	}
	componentDidMount() {

		PagerStore.on(PagerConstants.PAGE_TRANSITION_OUT, this.onPageTransitionOut)
		PagerStore.on(PagerConstants.PAGE_TRANSITION_OUT_COMPLETE, this.onPageTransitionOutComplete)

		this.map = map(this.element, AppConstants.TRANSITION)

		super.componentDidMount()
	}
	onPageTransitionOut() {
		this.map.highlight(Router.getOldHash(), Router.getNewHash())
	}
	onPageTransitionOutComplete() {
		console.log('onPageTransitionOutComplete')
	}
	resize() {
		if(!this.domIsReady) return
		this.map.resize()
	}
}

export default TransitionMap


