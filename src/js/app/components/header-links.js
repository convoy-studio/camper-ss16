import AppStore from 'AppStore'
import AppConstants from 'AppConstants'

var headerLinks = (parent)=> {
	var scope;

	var onSubMenuMouseEnter = (e)=> {
		e.preventDefault()
		var $target = $(e.currentTarget)
		$target.addClass('hovered')
	}
	var onSubMenuMouseLeave = (e)=> {
		e.preventDefault()
		var $target = $(e.currentTarget)
		$target.removeClass('hovered')
	}

	var camperLabEl = parent.find('.camper-lab').get(0)
	var shopEl = parent.find('.shop-wrapper').get(0)
	var mapEl = parent.find('.map-btn').get(0)

	shopEl.addEventListener('mouseenter', onSubMenuMouseEnter)
	shopEl.addEventListener('mouseleave', onSubMenuMouseLeave)

	scope = {
		resize: ()=> {
			var windowW = AppStore.Window.w
			var windowH = AppStore.Window.h
			var padding = AppConstants.PADDING_AROUND / 3

			var camperLabCss = {
				left: windowW - (AppConstants.PADDING_AROUND * 0.6) - padding - $(camperLabEl).width(),
				top: AppConstants.PADDING_AROUND,
			}
			var shopCss = {
				left: camperLabCss.left - $(shopEl).width() - padding,
				top: AppConstants.PADDING_AROUND,
			}
			var mapCss = {
				left: shopCss.left - $(mapEl).width() - padding,
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