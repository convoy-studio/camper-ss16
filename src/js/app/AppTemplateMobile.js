import BaseComponent from 'BaseComponent'
import AppStore from 'AppStore'
import AppConstants from 'AppConstants'
import AppActions from 'AppActions'
import MobileTemplate from 'Mobile_hbs'
import FeedTemplate from 'Feed_hbs'
import footer from 'mobile-footer'
import dom from 'dom-hand'

class AppTemplateMobile extends BaseComponent {
	constructor() {
		super()

		this.scope = {}
		var generaInfos = AppStore.generalInfos()
		this.scope.infos = AppStore.globalContent()
		this.scope.labUrl = generaInfos['lab_url']

		this.resize = this.resize.bind(this)
		this.onOpenFeed = this.onOpenFeed.bind(this)
		this.onOpenGrid = this.onOpenGrid.bind(this)

		// find urls for each feed
		this.feed = AppStore.getFeed()
		var baseUrl = AppStore.baseMediaPath()
		var i, feed, folder, icon, pageId, scope;
		for (i = 0; i < this.feed.length; i++) {
			feed = this.feed[i]
			folder = baseUrl + 'image/diptyque/' + feed.id + '/' + feed.person + '/'
			icon = folder + 'icon.jpg'
			pageId = feed.id + '/' + feed.person 
			scope = AppStore.getRoutePathScopeById(pageId)
			feed.icon = icon
			if(feed.media.type == 'image' && feed.media.id == 'shoe') {
				feed.media.url = folder + 'mobile/' + 'shoe.jpg'
			}
			if(feed.media.type == 'image' && feed.media.id == 'character') {
				feed.media.url = folder + 'mobile/' + 'character.jpg'
			}
			if(feed.media.type == 'video' && feed.media.id == 'fun-fact') {
				feed.media['is-video'] = true
				feed.media.url = scope['wistia-fun-id']
			}
			if(feed.media.type == 'video' && feed.media.id == 'character') {
				feed.media['is-video'] = true
				feed.media.url = scope['wistia-character-id']
			}
		}

		AppStore.on(AppConstants.OPEN_FEED, this.onOpenFeed) 
		AppStore.on(AppConstants.OPEN_GRID, this.onOpenGrid) 
	}
	render(parent) {
		super.render('AppTemplateMobile', parent, MobileTemplate, this.scope)
	}
	componentWillMount() {
		super.componentWillMount()
	}
	componentDidMount() {

		this.footer = footer(this.element, this.scope)
		this.mainContainer = dom.select('.main-container', this.element)

		AppActions.openFeed()

		setTimeout(()=>{
			this.onReady()
		}, 0)
		GlobalEvents.resize()
		super.componentDidMount()
	}
	onReady() {
		AppStore.on(AppConstants.WINDOW_RESIZE, this.resize)
	}
	onOpenFeed() {
		this.currentPage = document.createElement('div')
		var scope = {
			feed: this.feed
		}
		var t = FeedTemplate(scope)
		this.currentPage.innerHTML = t
		dom.tree.add(this.mainContainer, this.currentPage)
	}
	onOpenGrid() {
		console.log('grid')
	}
	resize() {

		this.footer.resize()

		super.resize()
	}
}

export default AppTemplateMobile

