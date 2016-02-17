import AppStore from 'AppStore'
import videoCanvas from 'video-canvas'
import Utils from 'Utils'
import AppConstants from 'AppConstants'
import dom from 'dom-hand'
import gridPositions from 'grid-positions'

var grid = (props, parent, onItemEnded)=> {

	var videoEnded = (item)=> {
		onItemEnded(item)
		scope.transitionOutItem(item)
	}

	var imageEnded = (item)=> {
		onItemEnded(item)
		scope.transitionOutItem(item)
	}

	var gridContainer = dom.select(".grid-container", parent)
	var linesGridContainer = dom.select('.lines-grid-container', parent)
	var gridChildren = gridContainer.children
	var linesHorizontal = dom.select(".lines-grid-container .horizontal-lines", parent).children
	var linesVertical = dom.select(".lines-grid-container .vertical-lines", parent).children
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

	var resize = (gGrid)=> {
		var windowW = AppStore.Window.w
		var windowH = AppStore.Window.h

		var originalVideoSize = AppConstants.HOME_VIDEO_SIZE
		var blockSize = gGrid.blockSize

		linesGridContainer.style.width = windowW + 'px'
		linesGridContainer.style.height = windowH + 'px'
		linesGridContainer.style.position = 'absolute'

		var resizeVars = Utils.ResizePositionProportionally(blockSize[0], blockSize[1], originalVideoSize[0], originalVideoSize[1])
		
		var gPos = gGrid.positions
		var parent, item;
		var count = 0
		var hl, vl;
		for (var i = 0; i < gPos.length; i++) {
			var row = gPos[i]

			// horizontal lines
			if(i > 0) {
				hl = scope.lines.horizontal[i-1]
				hl.style.top = blockSize[1] * i + 'px'
			}

			for (var j = 0; j < row.length; j++) {
				
				parent = scope.children[count]
				item = scope.items[count]

				// block divs
				parent.style.position = 'absolute'
				parent.style.width = blockSize[0] + 'px'
				parent.style.height = blockSize[1] + 'px'
				parent.style.left = row[j][0] + 'px'
				parent.style.top = row[j][1] + 'px'

				item.canvas.width = blockSize[ 0 ]
				item.canvas.height = blockSize[ 1 ]
				item.resize(resizeVars.left, resizeVars.top, resizeVars.width, resizeVars.height)
				item.drawOnce()

				// vertical lines
				if(i == 0 && j > 0) {
					vl = scope.lines.vertical[j-1]
					vl.style.left = blockSize[0] * j + 'px'
				}

				count++
			}
		}

	}

	scope = {
		el: gridContainer,
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
				item.timeout(imageEnded, 2000)
				item.seek(Utils.Rand(2, 10, 0))
			}
		},
		transitionOutItem: (item)=> {
			item.canvas.classList.remove('enable')

			item.video.currentTime(0)
			item.pause()
			setTimeout(()=>{
				item.drawOnce()
			}, 500)
		},
		clear: ()=> {
			for (var i = 0; i < items.length; i++) {
				items[i].clear()
			};
		}
	} 

	return scope
}

export default grid