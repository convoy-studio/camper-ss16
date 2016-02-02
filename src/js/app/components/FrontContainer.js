import BaseComponent from 'BaseComponent'
import template from 'FrontContainer_hbs'
import AppStore from 'AppStore'
import AppConstants from 'AppConstants'
import AppActions from 'AppActions'
import headerLinks from 'header-links'
import socialLinks from 'social-links'
import Router from 'Router'

class FrontContainer extends BaseComponent {
	constructor() {
		super()

		this.onPageChange = this.onPageChange.bind(this)
	}
	render(parent) {
		var scope = {}
		var generaInfos = AppStore.generalInfos()
		scope.infos = AppStore.globalContent()
		scope.facebookUrl = generaInfos['facebook_url']
		scope.twitterUrl = generaInfos['twitter_url']
		scope.instagramUrl = generaInfos['instagram_url']
		scope.labUrl = generaInfos['lab_url']
		scope.menShopUrl = 'http://www.camper.com/'+JS_lang+'_'+JS_country+'/men/shoes/new-collection'
		scope.womenShopUrl = 'http://www.camper.com/'+JS_lang+'_'+JS_country+'/women/shoes/new-collection'

		super.render('FrontContainer', parent, template, scope)
	}
	componentWillMount() {
		super.componentWillMount()
	}
	componentDidMount() {

		AppStore.on(AppConstants.PAGE_HASHER_CHANGED, this.onPageChange)

		this.headerLinks = headerLinks(this.element)
		this.socialLinks = socialLinks(this.element)

		super.componentDidMount()

	}
	onPageChange() {
		var hashObj = Router.getNewHash()
		if(hashObj.type == AppConstants.DIPTYQUE) {
			this.socialLinks.hide()			
		}else{
			this.socialLinks.show()
		}
	}
	resize() {

		if(!this.domIsReady) return
		this.headerLinks.resize()
		this.socialLinks.resize()

	}
}

export default FrontContainer


