import AppStore from 'AppStore'
import videoCanvas from 'video-canvas'
import Utils from 'Utils'
import AppConstants from 'AppConstants'

var grid = (props, parent, onItemEnded)=> {

	var videoEnded = (item)=> {
		onItemEnded(item)
		scope.transitionOutItem(item)
	}

	var imageEnded = (item)=> {
		onItemEnded(item)
		scope.transitionOutItem(item)
	}

	var $gridContainer = parent.find(".grid-container")
	var gridChildren = $gridContainer.children().get()
	var linesHorizontal = parent.find(".lines-grid-container .horizontal-lines").children().get()
	var linesVertical = parent.find(".lines-grid-container .vertical-lines").children().get()
	var scope;
	var currentSeat;
	var items = []
	var totalNum = props.data.grid.length
	var videos = AppStore.getHomeVideos()

	var vCanvasProps = {
		autoplay: false,
		volume: 0,
		loop: false,
		onEnded: videoEnded
	}

	for (var i = 0; i < totalNum; i++) {
		var vParent = gridChildren[i]
		var videoIndex = i % videos.length
		var vCanvas = videoCanvas( videos[videoIndex], vCanvasProps )
		vParent.appendChild(vCanvas.canvas)
		items[i] = vCanvas
	}

	var resize = ()=> {
		var windowW = AppStore.Window.w
		var windowH = AppStore.Window.h

		var originalVideoSize = AppConstants.HOME_VIDEO_SIZE
		var blockSize = [ windowW / AppConstants.GRID_ROWS, windowH / AppConstants.GRID_COLUMNS ]

		var resizeVars = Utils.ResizePositionProportionally(blockSize[0], blockSize[1], originalVideoSize[0], originalVideoSize[1])

		var pos = [ 0, 0 ]
		var horizontalLinesIndex = 0
		var verticalLinesIndex = 0
		for (var i = 0; i < scope.num; i++) {
			var item = scope.items[i]
			var parent = scope.children[i]

			parent.style.position = 'absolute'
			parent.style.width = blockSize[ 0 ] + 'px'
			parent.style.height = blockSize[ 1 ] + 'px'
			parent.style.left = pos[ 0 ] + 'px'
			parent.style.top = pos[ 1 ] + 'px'
			
			item.canvas.width = blockSize[ 0 ]
			item.canvas.height = blockSize[ 1 ]
			item.resize(resizeVars.left, resizeVars.top, resizeVars.width, resizeVars.height)
			item.drawOnce()
			
			if(i > 0) {
				var vl = scope.lines.vertical[verticalLinesIndex]
				if(vl) vl.style.left = pos[ 0 ] + 'px'
				verticalLinesIndex += 1
			}

			// positions
			scope.positions[ i ] = [ pos[ 0 ], pos[ 1 ] ]
			pos[ 0 ] += blockSize[ 0 ]
			if( pos[ 0 ] > windowW - (blockSize[ 0 ] >> 1) ) {
				
				pos[ 1 ] += blockSize[ 1 ]
				pos[ 0 ] = 0

				var hl = scope.lines.horizontal[horizontalLinesIndex]
				if(hl) hl.style.top = pos[ 1 ] + 'px'
				horizontalLinesIndex += 1
			}
		};

	}

	scope = {
		el: $gridContainer,
		children: gridChildren,
		items: items,
		num: totalNum,
		positions: [],
		lines: {
			horizontal: linesHorizontal,
			vertical: linesVertical
		},
		resize: resize,
		transitionInItem: (index, type)=> {
			var item = scope.items[index]
			item.seat = index

			item.canvas.classList.add('enable')
			
			if(type == AppConstants.ITEM_VIDEO) {
				item.play()
			}else{
				item.timeout(imageEnded, 4000)
				item.seek(Utils.Rand(2, 10, 0))
			}
		},
		transitionOutItem: (item)=> {
			item.canvas.classList.remove('enable')

			item.video.currentTime = 0
			item.pause()
			setTimeout(()=>{
				item.drawOnce()
			}, 500)
		}
	} 

	return scope
}

export default grid