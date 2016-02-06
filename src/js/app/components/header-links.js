import AppStore from 'AppStore'
import AppConstants from 'AppConstants'
import dom from 'dom-hand'

var headerLinks = (parent)=> {
	var scope;

	var onSubMenuMouseEnter = (e)=> {
		e.preventDefault()
		dom.classes.add(e.currentTarget, 'hovered')
	}
	var onSubMenuMouseLeave = (e)=> {
		e.preventDefault()
		dom.classes.remove(e.currentTarget, 'hovered')
	}

	var camperLabEl = dom.select('.camper-lab', parent)
	var shopEl = dom.select('.shop-wrapper', parent)
	var mapEl = dom.select('.map-btn', parent)

	shopEl.addEventListener('mouseenter', onSubMenuMouseEnter)
	shopEl.addEventListener('mouseleave', onSubMenuMouseLeave)

	scope = {
		resize: ()=> {
			var windowW = AppStore.Window.w
			var windowH = AppStore.Window.h
			var padding = AppConstants.PADDING_AROUND / 3

			var camperLabCss = {
				left: windowW - (AppConstants.PADDING_AROUND * 0.6) - padding - dom.size(camperLabEl)[0],
				top: AppConstants.PADDING_AROUND,
			}
			var shopCss = {
				left: camperLabCss.left - dom.size(shopEl)[0] - padding,
				top: AppConstants.PADDING_AROUND,
			}
			var mapCss = {
				left: shopCss.left - dom.size(mapEl)[0] - padding,
				top: AppConstants.PADDING_AROUND,
			}

			camperLabEl.style.left = camperLabCss.left + 'px'
			camperLabEl.style.top = camperLabCss.top + 'px'
			shopEl.style.left = shopCss.left + 'px'
			shopEl.style.top = shopCss.top + 'px'
			mapEl.style.left = mapCss.left + 'px'
			mapEl.style.top = mapCss.top + 'px'
		}
	}

	return scope
}

export default headerLinks