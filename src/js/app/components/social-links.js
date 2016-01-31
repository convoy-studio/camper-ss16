import AppStore from 'AppStore'
import AppConstants from 'AppConstants'

var socialLinks = (parent)=> {

	var scope;
	var wrapper = parent.find("#footer #social-wrapper").get(0)

	scope = {
		resize: ()=> {
			var windowW = AppStore.Window.w
			var windowH = AppStore.Window.h
			var padding = AppConstants.PADDING_AROUND * 0.4

			var socialCss = {
				left: windowW - padding - $(wrapper).width(),
				top: windowH - padding - $(wrapper).height(),
			}

			wrapper.style.left = socialCss.left + 'px'
			wrapper.style.top = socialCss.top + 'px'
		}
	}

	return scope
}

export default socialLinks