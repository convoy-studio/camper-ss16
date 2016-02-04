import AppActions from 'AppActions'
import dom from 'dom-handler'
    	
class GlobalEvents {
	init() {
		dom.event.on(window, 'resize', this.resize)
	}
	resize() {
		AppActions.windowResize(window.innerWidth, window.innerHeight)
	}
}

export default GlobalEvents
