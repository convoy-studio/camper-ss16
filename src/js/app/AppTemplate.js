import BaseComponent from 'BaseComponent'
import FrontContainer from 'FrontContainer'
import PagesContainer from 'PagesContainer'
import AppStore from 'AppStore'
import AppConstants from 'AppConstants'
import AppActions from 'AppActions'
import PXContainer from 'PXContainer'

class AppTemplate extends BaseComponent {
	constructor() {
		super()
		this.resize = this.resize.bind(this)
		this.animate = this.animate.bind(this)
	}
	render(parent) {
		super.render('AppTemplate', parent, undefined)
	}
	componentWillMount() {
		super.componentWillMount()
	}
	componentDidMount() {
		this.frontContainer = new FrontContainer()
		this.frontContainer.render('#app-template')

		this.pagesContainer = new PagesContainer()
		this.pagesContainer.render('#app-template')

		this.pxContainer = new PXContainer()
		this.pxContainer.init('#app-template')
		AppActions.pxContainerIsReady(this.pxContainer)

		setTimeout(()=>{
			this.isReady()
			this.onReady()
		}, 0)

		GlobalEvents.resize()

		super.componentDidMount()
	}
	onReady() {
		AppStore.on(AppConstants.WINDOW_RESIZE, this.resize)
		this.animate()
	}
	animate() {
		requestAnimationFrame(this.animate)
	    this.pxContainer.update()
	    this.pagesContainer.update()
	}
	resize() {
		this.frontContainer.resize()
		this.pxContainer.resize()
		this.pagesContainer.resize()
		super.resize()
	}
}

export default AppTemplate

