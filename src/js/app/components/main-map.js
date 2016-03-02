import AppStore from 'AppStore'
import AppConstants from 'AppConstants'
import Utils from 'Utils'
import dom from 'dom-hand'
import template from 'Map_hbs'

export default (parent, type) => {

	// render map
	var mapWrapper = dom.select('.map-wrapper', parent)
	var el = document.createElement('div')
	var t = template()
	el.innerHTML = t
	dom.tree.add(mapWrapper, el)

	var scope;
	var dir, stepEl;
	var selectedDots = [];
	var currentPaths, fillLine, dashedLine, stepTotalLen = 0;
	var previousHighlightIndex = undefined;
	var el = dom.select('.map-wrapper', parent)
	var svgMap = dom.select('svg', el)
	var titlesWrapper = dom.select('.titles-wrapper', el)
	var mapdots = dom.select.all('#map-dots .dot-path', el)
	var footsteps = dom.select.all('#footsteps g', el)
	var mallorcaLogo = dom.select('#mallorca-logo path', el)
	var currentDot;

	// fix buggy origin position
	if(AppStore.Detector.isFirefox) {
		var i, dot;
		for (i = 0; i < mapdots.length; i++) {
			dot = mapdots[i]
			dom.classes.add(dot, 'fix-buggy-origin-position')
		}
	}

	var findDotById = (parent, child)=> {
		for (var i = 0; i < mapdots.length; i++) {
			var dot = mapdots[i]
			if(parent == dot.id) {
				if(child == dot.getAttribute('data-parent-id')) {
					return dot
				}
			}
		}
	}

	var onCellMouseEnter = (item)=> {
		currentDot = findDotById(item[1], item[0])
		dom.classes.add(currentDot, 'animate')
	}
	var onCellMouseLeave = (item)=> {
		dom.classes.remove(currentDot, 'animate')
	}

	if(type == AppConstants.INTERACTIVE) {

		AppStore.on(AppConstants.CELL_MOUSE_ENTER, onCellMouseEnter)
		AppStore.on(AppConstants.CELL_MOUSE_LEAVE, onCellMouseLeave)

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
		el: mapWrapper,
		resize: ()=> {
			var windowW = AppStore.Window.w
			var windowH = AppStore.Window.h

			var mapW = 760, mapH = 645
			var mapSize = []
			var resizeVars = Utils.ResizePositionProportionally(windowW*0.35, windowH*0.35, mapW, mapH)
			mapSize[0] = mapW * resizeVars.scale
			mapSize[1] = mapH * resizeVars.scale

			el.style.width = mapSize[0] + 'px'
			el.style.height = mapSize[1] + 'px'
			el.style.left = (windowW >> 1) - (mapSize[0] >> 1) - 40 + 'px'
			el.style.top = (windowH >> 1) - (mapSize[1] >> 1) + (mapSize[1] * 0.08) + 'px'

			svgMap.style.width = mapSize[0] + 'px'
			svgMap.style.height = mapSize[1] + 'px'

			titles['deia'].el.style.left = titlePosX(mapSize[0], 640) + 'px'
			titles['deia'].el.style.top = titlePosY(mapSize[1], 280) + 'px'
			titles['es-trenc'].el.style.left = titlePosX(mapSize[0], 1070) + 'px'
			titles['es-trenc'].el.style.top = titlePosY(mapSize[1], 720) + 'px'
			titles['arelluf'].el.style.left = titlePosX(mapSize[0], 340) + 'px'
			titles['arelluf'].el.style.top = titlePosY(mapSize[1], 450) + 'px'
		},
		highlightDots: (oldHash, newHash)=> {
			selectedDots = []
			for (var i = 0; i < mapdots.length; i++) {
				var dot = mapdots[i]
				var id = dot.id
				var parentId = dot.getAttribute('data-parent-id')
				// if(id == oldHash.target && parentId == oldHash.parent) selectedDots.push(dot)
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
				// console.log(id, oldId, newId)
				if(id.indexOf(oldId) > -1 && id.indexOf(newId) > -1) {

					// console.log(oldId, newId)
					// check if the last one
					// if(i == previousHighlightIndex) stepEl = footsteps[footsteps.length-1]
					// else stepEl = step
					
					stepEl = step
					// console.log(stepEl)

					dir = id.indexOf(current) > -1 ? AppConstants.FORWARD : AppConstants.BACKWARD
					previousHighlightIndex = i
				}
			};

			scope.highlightDots(oldHash, newHash)

			// currentPaths = dom.select.all('path', stepEl)
			// fillLine = currentPaths[0]
			// // dashedLine = currentPaths[0]

			// // choose path depends of footstep direction
			// // if(dir == AppConstants.FORWARD) {
			// // 	fillLine = currentPaths[0]
			// // 	currentPaths[1].style.opacity = 0
			// // }else{
			// // 	fillLine = currentPaths[1]
			// // 	currentPaths[0].style.opacity = 0
			// // }

			// stepEl.style.opacity = 1

			// // find total length of shape
			// stepTotalLen = fillLine.getTotalLength()
			// fillLine.style['stroke-dashoffset'] = stepTotalLen
			// fillLine.style['stroke-dasharray'] = 0
			
			// // start animation of dashed line
			// // dom.classes.add(dashedLine, 'animate')

			// // start animation
			// dom.classes.add(fillLine, 'animate')

		},
		resetHighlight: ()=> {
			setTimeout(()=>{
				// stepEl.style.opacity = 0
				// currentPaths[0].style.opacity = 1
				// currentPaths[1].style.opacity = 1
				// dom.classes.remove(fillLine, 'animate')
				// dom.classes.remove(dashedLine, 'animate')
				for (var i = 0; i < selectedDots.length; i++) {
					var dot = selectedDots[i]
					dom.classes.remove(dot, 'animate')
				};
			}, 0)
		},
		updateProgress: (progress)=> {
			// if(fillLine == undefined) return
			var dashOffset = (progress / 1) * stepTotalLen
			// fillLine.style['stroke-dashoffset'] = stepTotalLen - dashOffset
			// fillLine.style['stroke-dasharray'] = dashOffset
		},
		clear: ()=> {
			if(type == AppConstants.INTERACTIVE) {
				AppStore.off(AppConstants.CELL_MOUSE_ENTER, onCellMouseEnter)
				AppStore.off(AppConstants.CELL_MOUSE_LEAVE, onCellMouseLeave)
			}
			titles = null
		}
	}
	return scope
}