import AppStore from 'AppStore'
import AppActions from 'AppActions'
import AppTemplate from 'AppTemplate'
import Router from 'Router'
import GEvents from 'GlobalEvents'
import Preloader from 'Preloader'

class App {
	constructor() {
		this.onAppReady = this.onAppReady.bind(this)
		this.loadMainAssets = this.loadMainAssets.bind(this)
	}
	init() {
		// Init router
		this.router = new Router()
		this.router.init()

		// Init Preloader
		AppStore.Preloader = new Preloader()

		// Init global events
		window.GlobalEvents = new GEvents()
		GlobalEvents.init()

		var appTemplate = new AppTemplate()
		appTemplate.isReady = this.loadMainAssets
		appTemplate.render('#app-container')

		// Start routing
		this.router.beginRouting()
	}
	loadMainAssets() {
		var hashUrl = location.hash.substring(2)
		var parts = hashUrl.substr(1).split('/')
		var manifest = AppStore.pageAssetsToLoad()
		if(manifest.length < 1) this.onAppReady()
		else AppStore.Preloader.load(manifest, this.onAppReady)
	}
	onAppReady() {
		AppActions.pageHasherChanged()
	}
}

export default App
    	
