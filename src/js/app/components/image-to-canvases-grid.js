import img from 'img'
import dom from 'dom-hand'

export default (container)=> {

	var scope;
	var el = dom.select('.grid-background-container', container)
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	var onImgLoadedCallback;
	var grid;
	var isReady = false

	var onImgReady = (error, el)=> {
		console.log('done', el)
		isReady = true
		scope.resize()
		if(onImgLoadedCallback) onImgLoadedCallback()
	}

	scope = {
		resize: (gGrid)=> {

			grid = gGrid != undefined ? gGrid : grid

			if(!isReady) return

			console.log(grid)
		},
		load: (url, cb)=> {
			onImgLoadedCallback = cb
			img(url, onImgReady)
		}
	}

	return scope

}