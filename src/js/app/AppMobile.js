import AppStore from 'AppStore'
import AppActions from 'AppActions'
import AppTemplateMobile from 'AppTemplateMobile'
import Router from 'Router'
import GEvents from 'GlobalEvents'

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

		// Start routing
		router.beginRouting()
	}
}

export default AppMobile
    	
