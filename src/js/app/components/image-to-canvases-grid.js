import img from 'img'
import dom from 'dom-hand'
import AppStore from 'AppStore'
import AppConstants from 'AppConstants'
import Utils from 'Utils'

export default (container)=> {

	var scope;
	var el = dom.select('.grid-background-container', container)
	// var canvases = el.children
	// var canvas = document.createElement('canvas');
	// var ctx = canvas.getContext('2d');
	var onImgLoadedCallback;
	var grid;
	var image;
	var isReady = false
	var anim = {
		x:0,
		y:0
	}


	// var items = []
	// for (var i = 0; i < canvases.length; i++) {
	// 	var tmpCanvas = document.createElement('canvas') 
	// 	items[i] = {
	// 		canvas: canvases[i],
	// 		ctx: canvases[i].getContext('2d'),
	// 		tmpCanvas: tmpCanvas,
	// 		tmpContext: tmpCanvas.getContext('2d')
	// 	}
	// }

	var onImgReady = (error, i)=> {
		image = i
		dom.tree.add(el, image)
		isReady = true
		scope.resize(grid)
		if(onImgLoadedCallback) onImgLoadedCallback()
	}

	scope = {
		el: el,
		resize: (gGrid)=> {
			var windowW = AppStore.Window.w
			var windowH = AppStore.Window.h

			grid = gGrid

			if(!isReady) return

			var resizeVarsBg = Utils.ResizePositionProportionally(windowW, windowH, AppConstants.MEDIA_GLOBAL_W, AppConstants.MEDIA_GLOBAL_H)
			image.style.position = 'absolute'
			image.style.width = resizeVarsBg.width + 'px'
			image.style.height = resizeVarsBg.height + 'px'
			image.style.top = resizeVarsBg.top + 'px'
			image.style.left = resizeVarsBg.left + 'px'

			// var blockSize = gGrid.blockSize
			// var imageBlockSize = [ resizeVarsBg.width / gGrid.columns, resizeVarsBg.height / gGrid.rows ]
			// var gPos = gGrid.positions
			// var count = 0
			// var canvas, ctx, tmpContext, tmpCanvas;

			// for (var i = 0; i < gPos.length; i++) {
			// 	var row = gPos[i]

			// 	for (var j = 0; j < row.length; j++) {
					
			// 		canvas = items[count].canvas
			// 		ctx = items[count].ctx
			// 		tmpContext = items[count].tmpContext
			// 		tmpCanvas = items[count].tmpCanvas

			// 		// block divs
			// 		canvas.style.width = blockSize[0] + 'px'
			// 		canvas.style.height = blockSize[1] + 'px'
			// 		canvas.style.left = row[j][0] + 'px'
			// 		canvas.style.top = row[j][1] + 'px'

			// 		ctx.clearRect(0, 0, blockSize[0], blockSize[1])
			// 		tmpContext.save()
			// 		tmpContext.clearRect(0, 0, blockSize[0], blockSize[1])
			// 		tmpContext.drawImage(image, imageBlockSize[0]*j, imageBlockSize[1]*i, imageBlockSize[0], imageBlockSize[1], 0, 0, blockSize[0], blockSize[1])

			// 		tmpContext.restore()
			// 		ctx.drawImage(tmpCanvas, 0, 0)

			// 		count++
			// 	}
			// }
		},
		update: (mouse)=> {

			anim.x += (((mouse.nX-0.5)*40) - anim.x) * 0.05
			anim.y += (((mouse.nY-0.5)*20) - anim.y) * 0.05
			Utils.Translate(image, anim.x, anim.y, 1)

		},
		load: (url, cb)=> {
			onImgLoadedCallback = cb
			img(url, onImgReady)
		},
		clear: ()=> {
			el = null
			image = null
		}
	}

	return scope

}