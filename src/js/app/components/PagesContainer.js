import BaseComponent from 'BaseComponent'
import AppConstants from 'AppConstants'
import {PagerActions, PagerConstants} from 'Pager'
import AppStore from 'AppStore'
import BasePager from 'BasePager'
import Router from 'Router'
import Home from 'Home'
import HomeTemplate from 'Home_hbs'
import Diptyque from 'Diptyque'
import DiptyqueTemplate from 'Diptyque_hbs'

class PagesContainer extends BasePager {
	constructor() {
		super()
		this.didHasherChange = this.didHasherChange.bind(this)
		this.pageAssetsLoaded = this.pageAssetsLoaded.bind(this)
		AppStore.on(AppConstants.PAGE_HASHER_CHANGED, this.didHasherChange)
		AppStore.on(AppConstants.PAGE_ASSETS_LOADED, this.pageAssetsLoaded)
	}
	componentWillMount() {
		super.componentWillMount()
	}
	componentDidMount() {
		super.componentDidMount()
	}
	didHasherChange() {
		var newHash = Router.getNewHash()
		var oldHash = Router.getOldHash()
		if(oldHash == undefined) {
			this.templateSelection(newHash)
		}else{
			PagerActions.onTransitionOut()
			// this.willPageTransitionOut()
		}
	}
	templateSelection(newHash) {
		var type = undefined
		var template = undefined
		switch(newHash.type) {
			case AppConstants.DIPTYQUE:
				type = Diptyque
				template = DiptyqueTemplate
				break
			case AppConstants.HOME:
				type = Home
				template = HomeTemplate
				break
			default:
				type = Home
				template = HomeTemplate
		}
		this.setupNewComponent(newHash, type, template)
		this.currentComponent = this.components['new-component']
	}
	pageAssetsLoaded() {
		var newHash = Router.getNewHash()
		this.templateSelection(newHash)
		super.pageAssetsLoaded()
	}
	update() {
		if(this.currentComponent != undefined) this.currentComponent.update()
	}
	resize() {
		if(this.currentComponent != undefined) this.currentComponent.resize()
	}
}

export default PagesContainer



