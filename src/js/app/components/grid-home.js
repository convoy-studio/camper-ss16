import AppStore from 'AppStore'
import videoCanvas from 'video-canvas'
import Utils from 'Utils'
import AppConstants from 'AppConstants'
import dom from 'dom-hand'
import gridPositions from 'grid-positions'
import mediaCell from 'media-cell'

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
	var cells = []
	var totalNum = props.data.grid.length
	var videos = AppStore.getHomeVideos()

	var seats = [
		1, 3, 5,
		7, 9, 11, 13,
		15, 
		21, 23, 25
	]

	var vCanvasProps = {
		autoplay: false,
		volume: 0,
		loop: false,
		onEnded: videoEnded
	}

	var mCell;
	var counter = 0;
	for (var i = 0; i < totalNum; i++) {
		var vParent = gridChildren[i]
		cells[i] = undefined
		for (var j = 0; j < seats.length; j++) {
			if(i == seats[j]) {
				mCell = mediaCell(vParent, videos[counter])
				cells[i] = mCell
				counter++
			}
		}
	}

	var resize = (gGrid)=> {
		var windowW = AppStore.Window.w
		var windowH = AppStore.Window.h

		var originalVideoSize = AppConstants.HOME_VIDEO_SIZE
		var blockSize = gGrid.blockSize

		linesGridContainer.style.position = 'absolute'

		var resizeVars = Utils.ResizePositionProportionally(blockSize[0], blockSize[1], originalVideoSize[0], originalVideoSize[1])
		
		var gPos = gGrid.positions
		var parent, cell;
		var count = 0
		var hl, vl;
		for (var i = 0; i < gPos.length; i++) {
			var row = gPos[i]

			// horizontal lines
			if(i > 0) {
				hl = scope.lines.horizontal[i-1]
				hl.style.top = blockSize[1] * i + 'px'
				hl.style.width = windowW + 'px'
			}

			for (var j = 0; j < row.length; j++) {
				
				// vertical lines
				if(i == 0 && j > 0) {
					vl = scope.lines.vertical[j-1]
					vl.style.left = blockSize[0] * j + 'px'
					vl.style.height = windowH + 'px'
				}

				cell = scope.cells[count]
				if(cell != undefined) {
					cell.resize(blockSize, row[j], resizeVars)
				}

				count++
			}
		}

	}

	scope = {
		el: gridContainer,
		children: gridChildren,
		cells: cells,
		num: totalNum,
		positions: [],
		lines: {
			horizontal: linesHorizontal,
			vertical: linesVertical
		},
		resize: resize,
		init: ()=> {
			for (var i = 0; i < cells.length; i++) {
				if(cells[i] != undefined) {
					cells[i].init()
				}
			};
		},
		transitionInItem: (index, type)=> {
			// var item = scope.cells[index]
			// item.seat = index

			// item.canvas.classList.add('enable')
			
			// if(type == AppConstants.ITEM_VIDEO) {
			// 	item.play()
			// }else{
			// 	item.timeout(imageEnded, 2000)
			// 	item.seek(Utils.Rand(2, 10, 0))
			// }
		},
		transitionOutItem: (item)=> {
			// item.canvas.classList.remove('enable')

			// item.video.currentTime(0)
			// item.pause()
			// setTimeout(()=>{
			// 	item.drawOnce()
			// }, 500)
		},
		clear: ()=> {
			for (var i = 0; i < cells.length; i++) {
				if(cells[i] != undefined) {
					cells[i].clear()
				}
			};
		}
	} 

	return scope
}

export default grid