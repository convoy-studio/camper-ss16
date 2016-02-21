import BaseComponent from 'BaseComponent'
import AppStore from 'AppStore'
import AppConstants from 'AppConstants'
import AppActions from 'AppActions'
import MobileTemplate from 'Mobile_hbs'
import FeedTemplate from 'Feed_hbs'
import footer from 'mobile-footer'
import dom from 'dom-hand'
import scrolltop from 'simple-scrolltop'

class AppTemplateMobile extends BaseComponent {
	constructor() {
		super()

		this.scope = {}
		var generaInfos = AppStore.generalInfos()
		this.scope.infos = AppStore.globalContent()
		this.scope.labUrl = generaInfos['lab_url']

		this.scope.generic = AppStore.getRoutePathScopeById('/').texts[AppStore.lang()].generic

		this.resize = this.resize.bind(this)
		this.onOpenFeed = this.onOpenFeed.bind(this)
		this.onOpenGrid = this.onOpenGrid.bind(this)
		this.onScroll = this.onScroll.bind(this)

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
		this.posts = []
		this.totalPageHeight = 0
		this.pageEnded = false
		this.currentFeedIndex = 0
		this.allFeeds = []

		this.footer = footer(this.element, this.scope)
		this.mainContainer = dom.select('.main-container', this.element)
		this.feedEl = dom.select('.feed', this.mainContainer)

		AppActions.openFeed()

		setTimeout(()=>{
			this.onReady()
		}, 0)
		GlobalEvents.resize()
		super.componentDidMount()
	}
	onReady() {
		AppStore.on(AppConstants.WINDOW_RESIZE, this.resize)
		dom.event.on(window, 'scroll', this.onScroll)
	}
	onScroll(e) {
		e.preventDefault()

		requestAnimationFrame(()=> {
			var windowH = AppStore.Window.h
			var currentScroll = scrolltop() + windowH
			if(currentScroll > this.totalPageHeight) {
				this.onPageEnd()
			}
		})

	}
	onOpenFeed() {
		var currentFeed = this.getLastFeeds()
		this.updateFeedToDom(currentFeed)
		this.preparePosts()
	}
	updateFeedToDom(feed) {
		var scope = {
			feed: feed
		}
		var h = document.createElement('div')
		var t = FeedTemplate(scope)
		h.innerHTML = t
		dom.tree.add(this.feedEl, h)
	}
	getLastFeeds() {
		var counter = 0
		var feed = []
		for (var i = this.currentFeedIndex; i < this.currentFeedIndex+4; i++) {
			var f = this.feed[i]
			counter++
			feed.push(f)
		}
		this.currentFeedIndex += counter
		return feed
	}
	preparePosts() {
		this.posts = []
		var posts = dom.select.all('.post', this.feedEl)
		for (var i = 0; i < posts.length; i++) {
			var el = posts[i]
			this.posts[i] = {
				el: el,
				mediaWrapper: dom.select('.media-wrapper', el),
				iconsWrapper: dom.select('.icons-wrapper', el),
				commentsWrapper: dom.select('.comments-wrapper', el),
				topWrapper: dom.select('.top-wrapper', el)
			}
		}
		this.resize()
	}
	onOpenGrid() {
		console.log('grid')
	}
	onPageEnd() {
		if(this.pageEnded) return
		if(this.currentFeedIndex >= this.feed.length) return
		var currentFeed = this.getLastFeeds()
		this.updateFeedToDom(currentFeed)
		this.preparePosts()
		setTimeout(()=>{
			this.pageEnded = false
		}, 50)
		this.pageEnded = true
	}
	resize() {

		var windowW = AppStore.Window.w
		var windowH = AppStore.Window.h

		this.totalPageHeight = 0
		for (var i = 0; i < this.posts.length; i++) {
			var post = this.posts[i]
			var topSize = dom.size(post.topWrapper)
			var iconsSize = dom.size(post.iconsWrapper)
			var commentsSize = dom.size(post.commentsWrapper)
			post.mediaWrapper.style.width = windowW + 'px'
			post.mediaWrapper.style.height = windowW + 'px'
			this.totalPageHeight += windowW
			this.totalPageHeight += iconsSize[1]
			this.totalPageHeight += commentsSize[1]
			this.totalPageHeight += topSize[1]
		}

		this.footer.resize()

		super.resize()
	}
}

export default AppTemplateMobile

