import hasher from 'hasher'
import AppActions from 'AppActions'
import crossroads from 'crossroads'
import AppStore from 'AppStore'
import data from 'GlobalData'
import AppConstants from 'AppConstants'

class Router {
	init() {
		this.routing = data.routing
		this.setupRoutes()
		this.firstPass = true
		this.newHashFounded = false
		hasher.newHash = undefined
		hasher.oldHash = undefined

		// remove the analytics parameters
		var loc = AppStore.Detector.isSafari ? location.hash : window.location.hash
		var hash = loc.split('?')
		window.location.hash = hash[0]

		hasher.initialized.add(this.didHasherChange.bind(this))
		hasher.changed.add(this.didHasherChange.bind(this))
		this.setupCrossroads()
	}
	beginRouting() {
		hasher.init()
	}
	setupCrossroads() {
	 	var routes = hasher.routes
	 	for (var i = 0; i < routes.length; i++) {
	 		var route = routes[i]
	 		crossroads.addRoute(route, this.onParseUrl.bind(this))
	 	};
		crossroads.addRoute('', this.onParseUrl.bind(this))
	}
	onParseUrl() {
		this.assignRoute()
	}
	onDefaultURLHandler() {
		this.sendToDefault()
	}
	assignRoute(id) {
		var hash = hasher.getHash()
		var parts = this.getURLParts(hash)
		this.updatePageRoute(hash, parts, parts[0], (parts[1] == undefined) ? '' : parts[1])
		this.newHashFounded = true
	}
	getURLParts(url) {
		var hash = url
		return hash.split('/')
	}
	updatePageRoute(hash, parts, parent, target) {
		hasher.oldHash = hasher.newHash
		hasher.newHash = {
			hash: hash,
			parts: parts,
			parent: parent,
			target: target
		}
		hasher.newHash.type = hasher.newHash.hash == '' ? AppConstants.HOME : AppConstants.DIPTYQUE
		// If first pass send the action from App.js when all assets are ready
		if(this.firstPass) {
			this.firstPass = false
		}else{
			AppActions.pageHasherChanged()
		}
	}
	didHasherChange(newHash, oldHash) {
		this.newHashFounded = false
		crossroads.parse(newHash)
		if(this.newHashFounded) return
		// If URL don't match a pattern, send to default
		this.onDefaultURLHandler()
	}
	sendToDefault() {
		hasher.setHash(AppStore.defaultRoute())
	}
	setupRoutes() {
		hasher.routes = []
		hasher.diptyqueRoutes = []
		var i = 0, k;
		for(k in this.routing) {
			hasher.routes[i] = k
			if(k.length > 2) hasher.diptyqueRoutes.push(k)
			i++
		}
	}
	static getBaseURL() {
		return document.URL.split("#")[0]
	}
	static getHash() {
		return hasher.getHash()
	}
	static getRoutes() {
		return hasher.routes
	}
	static getDiptyqueRoutes() {
		return hasher.diptyqueRoutes
	}
	static getNewHash() {
		return hasher.newHash
	}
	static getOldHash() {
		return hasher.oldHash
	}
	static setHash(hash) {
		hasher.setHash(hash)
	}
}

export default Router
