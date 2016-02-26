import BaseComponent from 'BaseComponent'
import template from 'FrontContainer_hbs'
import AppStore from 'AppStore'
import AppConstants from 'AppConstants'
import AppActions from 'AppActions'
import headerLinks from 'header-links'
import socialLinks from 'social-links'
import Router from 'Router'
import dom from 'dom-hand'

class FrontContainer extends BaseComponent {
	constructor() {
		super()
		this.onAppStarted = this.onAppStarted.bind(this)
	}
	render(parent) {
		var scope = {}
		var generaInfos = AppStore.generalInfos()
		scope.infos = AppStore.globalContent()
		scope.general = generaInfos

		super.render('FrontContainer', parent, template, scope)
	}
	componentWillMount() {
		super.componentWillMount()
	}
	componentDidMount() {
		this.headerEl = dom.select('header', this.element)
		AppStore.on(AppConstants.APP_START, this.onAppStarted)
		this.headerLinks = headerLinks(this.element)
		super.componentDidMount()
	}
	onAppStarted() {
		AppStore.off(AppConstants.APP_START, this.onAppStarted)
		dom.classes.add(this.headerEl, 'show')
	}
	resize() {
		if(!this.domIsReady) return
		this.headerLinks.resize()

	}
}

export default FrontContainer


