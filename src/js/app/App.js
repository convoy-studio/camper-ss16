import AppStore from 'AppStore'
import AppActions from 'AppActions'
import AppTemplate from 'AppTemplate'
import Router from 'Router'
import GEvents from 'GlobalEvents'
import Preloader from 'Preloader'
import AppConstants from 'AppConstants'
import dom from 'dom-hand'

class App {
	constructor() {
		this.onAppReady = this.onAppReady.bind(this)
		this.loadMainAssets = this.loadMainAssets.bind(this)
		this.onPlaneUpdate = this.onPlaneUpdate.bind(this)
		this.resize = this.resize.bind(this)
	}
	init() {
		// Init router
		this.router = new Router()
		this.router.init()

		// Init Preloader
		AppStore.Preloader = new Preloader()

		var p = document.getElementById('preloader')
		
		var plane = dom.select('#plane', p)
		var path = MorphSVGPlugin.pathDataToBezier("#motionPath")
		var tl = new TimelineMax()
		tl.eventCallback('onUpdate', this.onPlaneUpdate)
		tl.to(plane, 5, {bezier:{values:path, type:"cubic", autoRotate:true}, ease:Linear.easeOut}, 0)
		tl.pause()
		this.loaderAnim = {
			path: path,
			el: p,
			plane: plane,
			tl: tl
		}
		tl.tweenTo(3.5)

		// Init global events
		window.GlobalEvents = new GEvents()
		GlobalEvents.init()

		AppStore.on(AppConstants.WINDOW_RESIZE, this.resize)

		var appTemplate = new AppTemplate()
		appTemplate.isReady = this.loadMainAssets
		appTemplate.render('#app-container')

		// Start routing
		this.router.beginRouting()
	}
	onPlaneUpdate() {
		var scale = 2.2 - (this.loaderAnim.tl.progress() * 1.5)
		TweenMax.set(this.loaderAnim.plane, { scale:scale, force3D:true, transformOrigin: '50% 50%' })
	}
	resize() {
		var windowW = AppStore.Window.w
		var windowH = AppStore.Window.h

		setTimeout(()=> {
			var size = dom.size(this.loaderAnim.el)
			var el = this.loaderAnim.el
			el.style.left = (windowW >> 1) - (size[0]) + 'px'
			el.style.top = (windowH >> 1) + (size[1] * 0) + 'px'
			this.loaderAnim.el.style.opacity = 1
		}, 0)
	}
	loadMainAssets() {
		var hashUrl = location.hash.substring(2)
		var parts = hashUrl.substr(1).split('/')
		var manifest = AppStore.pageAssetsToLoad()
		if(manifest.length < 1) this.onAppReady()
		else AppStore.Preloader.load(manifest, this.onAppReady)
	}
	onAppReady() {
		// return
		this.loaderAnim.tl.timeScale(2.4).tweenTo(this.loaderAnim.tl.totalDuration() - 0.1)
		setTimeout(()=> {
			TweenMax.to(this.loaderAnim.el, 0.5, { opacity:0, force3D:true, ease:Expo.easeOut })
			setTimeout(()=> {
				AppStore.off(AppConstants.WINDOW_RESIZE, this.resize)
				dom.tree.remove(this.loaderAnim.el)
				this.loaderAnim.tl.eventCallback('onUpdate', null)
				this.loaderAnim.tl.clear()
				this.loaderAnim.tl = null
				this.loaderAnim = null
				setTimeout(()=>AppActions.appStart())
				setTimeout(()=>AppActions.pageHasherChanged())
			}, 200)
		}, 1500)
	}
}

export default App
    	
