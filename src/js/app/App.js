import AppStore from 'AppStore'
import AppActions from 'AppActions'
import AppTemplate from 'AppTemplate'
import Router from 'Router'
import GEvents from 'GlobalEvents'

class App {
	constructor() {
		this.onAppReady = this.onAppReady.bind(this)
	}
	init() {
		// Init router
		this.router = new Router()
		this.router.init()

		// Init global events
		window.GlobalEvents = new GEvents()
		GlobalEvents.init()

		var appTemplate = new AppTemplate()
		appTemplate.isReady = this.onAppReady
		appTemplate.render('#app-container')
	}
	onAppReady() {
		// Start routing
		this.router.beginRouting()
	}
}

export default App
    	
