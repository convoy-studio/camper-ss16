import AppStore from 'AppStore'
import AppConstants from 'AppConstants'
import Utils from 'Utils'

export default (parent) => {

	var onDotClick = (e)=> {
		e.preventDefault()
		var id = e.target.id
		var parentId = e.target.getAttribute('data-parent-id')
	}

	var scope;
	var $el = parent.find('.map-wrapper')
	var el = $el.get(0)
	var titlesWrapper = $el.find('.titles-wrapper').get(0)
	var mapdots = $el.find('#map-dots path').get()

	for (var i = 0; i < mapdots.length; i++) {
		var dot = mapdots[i]
		dot.addEventListener('click', onDotClick)
	};

	var titles = {
		'deia': {
			el: $(titlesWrapper).find(".deia").get(0)
		},
		'es-trenc': {
			el: $(titlesWrapper).find(".es-trenc").get(0)
		},
		'arelluf': {
			el: $(titlesWrapper).find(".arelluf").get(0)
		}
	}

	function titlePosX(parentW, val) {
		return (parentW / AppConstants.MEDIA_GLOBAL_W) * val
	}
	function titlePosY(parentH, val) {
		return (parentH / AppConstants.MEDIA_GLOBAL_H) * val
	}

	scope = {
		resize: ()=> {
			var windowW = AppStore.Window.w
			var windowH = AppStore.Window.h

			var mapW = 693, mapH = 645
			var mapSize = []
			var resizeVars = Utils.ResizePositionProportionally(windowW*0.47, windowH*0.47, mapW, mapH)
			mapSize[0] = mapW * resizeVars.scale
			mapSize[1] = mapH * resizeVars.scale

			el.style.width = mapSize[0] + 'px'
			el.style.height = mapSize[1] + 'px'
			el.style.left = (windowW >> 1) - (mapSize[0] >> 1) + 'px'
			el.style.top = (windowH >> 1) - (mapSize[1] >> 1) + 'px'

			titles['deia'].el.style.left = titlePosX(mapSize[0], 640) + 'px'
			titles['deia'].el.style.top = titlePosY(mapSize[1], 280) + 'px'
			titles['es-trenc'].el.style.left = titlePosX(mapSize[0], 1180) + 'px'
			titles['es-trenc'].el.style.top = titlePosY(mapSize[1], 760) + 'px'
			titles['arelluf'].el.style.left = titlePosX(mapSize[0], 210) + 'px'
			titles['arelluf'].el.style.top = titlePosY(mapSize[1], 460) + 'px'
		}
	}
	return scope
}