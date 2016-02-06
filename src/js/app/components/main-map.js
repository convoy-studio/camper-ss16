import AppStore from 'AppStore'
import AppConstants from 'AppConstants'
import Utils from 'Utils'
import Router from 'Router'
import dom from 'dom-hand'
import template from 'Map_hbs'

export default (parent, type) => {

	var onDotClick = (e)=> {
		e.preventDefault()
		var id = e.target.id
		var parentId = e.target.getAttribute('data-parent-id')
		Router.setHash(parentId + '/' + id)
	}

	// render map
	var mapWrapper = dom.select('.map-wrapper', parent)
	var el = document.createElement('div')
	var t = template()
	el.innerHTML = t
	dom.tree.add(mapWrapper, el)

	var scope;
	var dir, stepEl;
	var selectedDots = [];
	var previousHighlightIndex = undefined;
	var el = dom.select('.map-wrapper', parent)
	var titlesWrapper = dom.select('.titles-wrapper', el)
	var mapdots = dom.select.all('#map-dots .dot-path', el)
	var footsteps = dom.select.all('#footsteps g', el)

	if(type == AppConstants.INTERACTIVE) {
		for (var i = 0; i < mapdots.length; i++) {
			var dot = mapdots[i]
			dom.event.on(dot, 'click', onDotClick)
		};
	}

	var titles = {
		'deia': {
			el: dom.select('.deia', titlesWrapper)
		},
		'es-trenc': {
			el: dom.select('.es-trenc', titlesWrapper)
		},
		'arelluf': {
			el: dom.select('.arelluf', titlesWrapper)
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
			el.style.left = (windowW >> 1) - (mapSize[0] >> 1) - 40 + 'px'
			el.style.top = (windowH >> 1) - (mapSize[1] >> 1) + 'px'

			titles['deia'].el.style.left = titlePosX(mapSize[0], 740) + 'px'
			titles['deia'].el.style.top = titlePosY(mapSize[1], 250) + 'px'
			titles['es-trenc'].el.style.left = titlePosX(mapSize[0], 1280) + 'px'
			titles['es-trenc'].el.style.top = titlePosY(mapSize[1], 690) + 'px'
			titles['arelluf'].el.style.left = titlePosX(mapSize[0], 360) + 'px'
			titles['arelluf'].el.style.top = titlePosY(mapSize[1], 400) + 'px'
		},
		highlightDots: (oldHash, newHash)=> {
			selectedDots = []
			for (var i = 0; i < mapdots.length; i++) {
				var dot = mapdots[i]
				var id = dot.id
				var parentId = dot.getAttribute('data-parent-id')
				if(id == oldHash.target && parentId == oldHash.parent) selectedDots.push(dot)
				if(id == newHash.target && parentId == newHash.parent)  selectedDots.push(dot)
			}
			for (var i = 0; i < selectedDots.length; i++) {
				var dot = selectedDots[i]
				dom.classes.add(dot, 'animate')
			};
		},
		highlight: (oldHash, newHash)=> {
			var oldId = oldHash.target
			var newId = newHash.target
			var current = oldId + '-' + newId
			for (var i = 0; i < footsteps.length; i++) {
				var step = footsteps[i]
				var id = step.id
				if(id.indexOf(oldId) > -1 && id.indexOf(newId) > -1) {
					// check if the last one
					if(i == previousHighlightIndex) stepEl = footsteps[footsteps.length-1]
					else stepEl = step

					dir = id.indexOf(current) > -1 ? AppConstants.FORWARD : AppConstants.BACKWARD
					previousHighlightIndex = i
				}
			};

			scope.highlightDots(oldHash, newHash)

			var paths = dom.select.all('path', stepEl)
			var dashedLine = paths[0]
			var fillLine;

			// choose path depends of footstep direction
			if(dir == AppConstants.FORWARD) {
				fillLine = paths[1]
				paths[2].style.opacity = 0
			}else{
				fillLine = paths[2]
				paths[1].style.opacity = 0
			}

			stepEl.style.opacity = 1

			// find total length of shape
			var stepTotalLen = fillLine.getTotalLength()
			fillLine.style['stroke-dashoffset'] = 0
			fillLine.style['stroke-dasharray'] = stepTotalLen
			
			// start animation of dashed line
			dom.classes.add(dashedLine, 'animate')

			// start animation
			setTimeout(()=>{
				fillLine.style['stroke-dashoffset'] = stepTotalLen
				dom.classes.add(fillLine, 'animate')
			}, 1500)

			// remove animations and put everything back
			setTimeout(()=>{
				stepEl.style.opacity = 0
				paths[1].style.opacity = 1
				paths[2].style.opacity = 1
				dom.classes.remove(fillLine, 'animate')
				dom.classes.remove(dashedLine, 'animate')
				for (var i = 0; i < selectedDots.length; i++) {
					var dot = selectedDots[i]
					dom.classes.remove(dot, 'animate')
				};
			}, 4000)
		},
		clear: ()=> {
			if(type == AppConstants.INTERACTIVE) {
				for (var i = 0; i < mapdots.length; i++) {
					var dot = mapdots[i]
					dot.removeEventListener('click', onDotClick)
				};
			}
			titles = null
		}
	}
	return scope
}