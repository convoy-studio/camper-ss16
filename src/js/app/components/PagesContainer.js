import BaseComponent from 'BaseComponent'
import AppConstants from 'AppConstants'
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
		AppStore.on(AppConstants.PAGE_HASHER_CHANGED, this.didHasherChange)
	}
	componentWillMount() {
		super.componentWillMount()
	}
	componentDidMount() {
		super.componentDidMount()
	}
	didHasherChange() {
		var hash = Router.getNewHash()
		var type = undefined
		var template = undefined
		switch(hash.type) {
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
		this.setupNewComponent(hash, type, template)
		this.currentComponent = this.components['new-component']
	}
	update() {
		if(this.currentComponent != undefined) this.currentComponent.update()
	}
	resize() {
		if(this.currentComponent != undefined) this.currentComponent.resize()
	}
}

export default PagesContainer



