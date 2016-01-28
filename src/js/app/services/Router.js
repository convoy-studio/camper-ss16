import hasher from 'hasher'
import AppActions from 'AppActions'
import crossroads from 'crossroads'
import AppStore from 'AppStore'
import data from 'GlobalData'
import AppConstants from 'AppConstants'

class Router {
	init() {
		this.routing = data.routing
		this.newHashFounded = false
		hasher.newHash = undefined
		hasher.oldHash = undefined
		hasher.initialized.add(this._didHasherChange.bind(this))
		hasher.changed.add(this._didHasherChange.bind(this))
		this._setupCrossroads()
	}
	beginRouting() {
		hasher.init()
	}
	_setupCrossroads() {
	 	var routes = this.routing
		for(var key in routes) {
			if(key.length > 1) {
	    		crossroads.addRoute(key, this._onParseUrl.bind(this))
			}
		}
		crossroads.addRoute('', this._onParseUrl.bind(this))
	}
	_onParseUrl() {
		this._assignRoute()
	}
	_onDefaultURLHandler() {
		this._sendToDefault()
	}
	_assignRoute(id) {
		var hash = hasher.getHash()
		var parts = this._getURLParts(hash)
		this._updatePageRoute(hash, parts, parts[0], (parts[1] == undefined) ? '' : parts[1])
		this.newHashFounded = true
	}
	_getURLParts(url) {
		var hash = url
		return hash.split('/')
	}
	_updatePageRoute(hash, parts, parent, target) {
		hasher.oldHash = hasher.newHash
		hasher.newHash = {
			hash: hash,
			parts: parts,
			parent: parent,
			target: target
		}
		hasher.newHash.type = hasher.newHash.hash == '' ? AppConstants.HOME : AppConstants.DIPTYQUE
		AppActions.pageHasherChanged()
	}
	_didHasherChange(newHash, oldHash) {
		this.newHashFounded = false
		crossroads.parse(newHash)
		if(this.newHashFounded) return
		// If URL don't match a pattern, send to default
		this._onDefaultURLHandler()
	}
	_sendToDefault() {
		hasher.setHash(AppStore.defaultRoute())
	}
	static getBaseURL() {
		return document.URL.split("#")[0]
	}
	static getHash() {
		return hasher.getHash()
	}
	static getRoutes() {
		return AppStore.Data.routing
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
