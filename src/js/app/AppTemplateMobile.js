import BaseComponent from 'BaseComponent'
import AppStore from 'AppStore'
import AppConstants from 'AppConstants'
import AppActions from 'AppActions'
import MobileTemplate from 'Mobile_hbs'
import FeedTemplate from 'Feed_hbs'
import IndexTemplate from 'Index_hbs'
import footer from 'mobile-footer'
import dom from 'dom-hand'
import scrolltop from 'simple-scrolltop'
import Utils from 'Utils'
import colorUtils from 'color-utils'

class AppTemplateMobile extends BaseComponent {
	constructor() {
		super()

		this.scope = {}
		var generaInfos = AppStore.generalInfos()
		this.scope.infos = AppStore.globalContent()
		this.scope.labUrl = generaInfos['lab_url']
		this.scope.generic = AppStore.getRoutePathScopeById('/').texts[AppStore.lang()].generic
		this.scope.mobilemap = AppStore.baseMediaPath() + 'image/mobile_map.jpg'

		this.resize = this.resize.bind(this)
		this.onOpenFeed = this.onOpenFeed.bind(this)
		this.onOpenGrid = this.onOpenGrid.bind(this)
		this.onScroll = this.onScroll.bind(this)
		this.onIconClicked = this.onIconClicked.bind(this)

		// find urls for each feed
		this.index = []
		this.feed = AppStore.getFeed()
		var baseUrl = AppStore.baseMediaPath()
		var i, feed, folder, icon, pageId, scope;
		for (i = 0; i < this.feed.length; i++) {
			feed = this.feed[i]
			folder = baseUrl + 'image/diptyque/' + feed.id + '/' + feed.person + '/'
			icon = folder + 'icon.jpg'
			pageId = feed.id + '/' + feed.person 
			scope = AppStore.getRoutePathScopeById(pageId)
			// console.log(scope)
			feed.icon = icon
			feed.shopUrl = scope['shop-url']
			if(feed.media.type == 'image' && feed.media.id == 'shoe') {
				feed.media.url = folder + 'mobile/' + 'shoe.jpg'
				feed.comments[0]['person-text'] += ' <a target="_blank" href="'+feed.shopUrl+'">#Shop'+Utils.CapitalizeFirstLetter(feed.comments[0]['person-name'])+'</a>'
				feed.media['is-shop'] = true
			}
			if(feed.media.type == 'image' && feed.media.id == 'character') {
				feed.media.url = folder + 'mobile/' + 'character.jpg'
			}
			if(feed.media.type == 'video' && feed.media.id == 'fun-fact') {
				feed.media['is-video'] = true
				feed.media.url = scope['wistia-fun-id']
				feed.comments[0]['person-text'] = scope.fact.en
			}
			if(feed.media.type == 'video' && feed.media.id == 'character') {
				feed.media['is-video'] = true
				feed.media.url = scope['wistia-character-id']
			}
			if(feed.media.type == 'image') {
				this.index.push(feed)
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
		this.indexEl = dom.select('.index', this.mainContainer)

		AppActions.openFeed()

		setTimeout(()=>{
			this.onReady()
		}, 0)
		GlobalEvents.resize()
		super.componentDidMount()
	}
	onReady() {
		
		var s = document.createElement("script");
		s.type = "text/javascript";
		s.src = "http://fast.wistia.com/assets/external/E-v1.js";
		dom.tree.add(this.element, s)

		AppStore.on(AppConstants.WINDOW_RESIZE, this.resize)
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
	onIconClicked(e) {
		e.preventDefault()
		var target = e.currentTarget
		var randomColor = colorUtils.randomColor()
		var path = dom.select('path', target)
		path.style.fill = randomColor
		dom.classes.add(target, 'highlight')
		setTimeout(()=> {
			dom.classes.remove(target, 'highlight')
		}, 300)
	}
	preparePosts() {
		this.posts = []
		var posts = dom.select.all('.post', this.feedEl)
		var i, el, icons, icon;
		for (i = 0; i < posts.length; i++) {
			el = posts[i]
			icons = dom.select.all('#icon', el)
			for (var j = 0; j < icons.length; j++) {
				icon = icons[j]
				dom.event.on(icon, 'click', this.onIconClicked)
			}
			this.posts[i] = {
				el: el,
				mediaWrapper: dom.select('.media-wrapper', el),
				iconsWrapper: dom.select('.icons-wrapper', el),
				commentsWrapper: dom.select('.comments-wrapper', el),
				topWrapper: dom.select('.top-wrapper', el),
				icons: icons
			}
		}
		this.resize()
	}
	onOpenFeed() {
		this.removeGrid()
		this.isFeed = true
		var currentFeed = this.getLastFeeds()
		this.updateFeedToDom(currentFeed)
		this.preparePosts()
		dom.event.on(window, 'scroll', this.onScroll)
		this.resize()
	}
	onOpenGrid() {
		this.removeFeed()
		this.isFeed = false
		dom.event.off(window, 'scroll', this.onScroll)
		var scope = {
			index: this.index
		}
		var t = IndexTemplate(scope)
		this.indexEl.innerHTML = t
		this.indexes = dom.select.all('.block', this.indexEl)
		this.resize()
	}
	removeFeed(){
		if(this.posts == undefined) return
		this.currentFeedIndex = 0
		for (var i = 0; i < this.posts.length; i++) {
			var post = this.posts[i]
			dom.tree.remove(post.el)
		}
	}
	removeGrid(){
		if(this.indexes == undefined) return
		for (var i = 0; i < this.indexes.length; i++) {
			var post = this.indexes[i]
			dom.tree.remove(post)
		}	
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

		if(this.isFeed) {
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
		}else{
			var w = windowW / 3
			var counter = 0
			var h = 0
			for (var i = 0; i < this.indexes.length; i++) {
				var index = this.indexes[i]
				index.style.width = w + 'px'
				index.style.height = w + 'px'
				index.style.left = w * counter + 'px'
				index.style.top = h + 'px'
				counter++
				if(counter >= 3) {
					h += w
					counter = 0
				}
			}
		}

		this.footer.resize()

		super.resize()
	}
}

export default AppTemplateMobile

