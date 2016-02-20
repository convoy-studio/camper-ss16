import AppStore from 'AppStore'
import AppActions from 'AppActions'
import AppTemplateMobile from 'AppTemplateMobile'
import Router from 'Router'
import GEvents from 'GlobalEvents'
import dom from 'dom-hand'

class AppMobile {
	constructor() {
	}
	init() {
		// Init router
		var router = new Router()
		router.init()

		// Init global events
		window.GlobalEvents = new GEvents()
		GlobalEvents.init()

		var appTemplateMobile = new AppTemplateMobile()
		appTemplateMobile.render('#app-container')

		var el = document.getElementById('preloader')
		dom.tree.remove(el)

		// Start routing
		router.beginRouting()
	}
}

export default AppMobile
    	
