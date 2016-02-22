import AppStore from 'AppStore'
import AppConstants from 'AppConstants'
import dom from 'dom-hand'
import textBtn from 'text-btn'

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

	var simpleTextBtnsEl = dom.select.all('.text-btn', parent)
	var simpleBtns = []
	var i, s, el;
	for (i = 0; i < simpleTextBtnsEl.length; i++) {
		el = simpleTextBtnsEl[i]
		s = textBtn(el)
		simpleBtns[i] = s
	}

	var shopWrapper = dom.select('.shop-wrapper', parent)
	shopWrapper.addEventListener('mouseenter', onSubMenuMouseEnter)
	shopWrapper.addEventListener('mouseleave', onSubMenuMouseLeave)

	scope = {
		resize: ()=> {
			var windowW = AppStore.Window.w
			var windowH = AppStore.Window.h
			var padding = AppConstants.PADDING_AROUND / 3

			var camperLab = simpleBtns[1]
			var shop = simpleBtns[2]
			var map = simpleBtns[0]
			var shopSize = dom.size(shopWrapper)

			var camperLabCss = {
				left: windowW - (AppConstants.PADDING_AROUND * 0.6) - padding - camperLab.size[0],
				top: AppConstants.PADDING_AROUND,
			}
			var shopCss = {
				left: camperLabCss.left - shopSize[0] - padding - 20,
				top: AppConstants.PADDING_AROUND,
			}
			var mapCss = {
				left: shopCss.left - map.size[0] - padding - 30,
				top: AppConstants.PADDING_AROUND,
			}

			shop.el.style.left = (shopSize[0] >> 1) - (shop.size[0] >> 1) + 'px'

			camperLab.el.style.left = camperLabCss.left + 'px'
			camperLab.el.style.top = camperLabCss.top + 'px'
			shopWrapper.style.left = shopCss.left + 'px'
			shopWrapper.style.top = shopCss.top + 'px'
			map.el.style.left = mapCss.left + 'px'
			map.el.style.top = mapCss.top + 'px'
		}
	}

	return scope
}

export default headerLinks