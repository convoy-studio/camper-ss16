import AppStore from 'AppStore'
import dom from 'dom-hand'
import miniVideo from 'mini-video'

export default (container, videoUrl)=> {

	var scope;
	var splitter = videoUrl.split('/')
	var name = splitter[splitter.length-1].split('.')[0]
	var imgId = 'home-video-shots/' + name
	var mCanvas = miniVideo({
		loop: true,
		autoplay: false
	})
	var size, position, resizeVars;
	var img;

	var onMouseEnter = (e)=> {
		e.preventDefault()
		if(mCanvas.isLoaded) {
			mCanvas.play(0)
		}else{
			mCanvas.load(videoUrl, ()=> {
				mCanvas.play()
			})
		}
	}

	var onMouseLeave = (e)=> {
		e.preventDefault()
		mCanvas.pause()
	}

	var onClick = (e)=> {
		e.preventDefault()
	}

	var init = ()=> {
		var imgUrl = AppStore.Preloader.getImageURL(imgId) 
		img = document.createElement('img')
		img.src = imgUrl
		dom.tree.add(container, img)
		dom.tree.add(container, mCanvas.el)

		dom.event.on(container, 'mouseenter', onMouseEnter)
		dom.event.on(container, 'mouseleave', onMouseLeave)
		dom.event.on(container, 'click', onClick)

		scope.isReady = true
	}

	scope = {
		isReady: false,
		init: init,
		resize: (s, p, rv)=> {

			size = s == undefined ? size : s
			position = p == undefined ? position : p
			resizeVars = rv == undefined ? resizeVars : rv

			if(!scope.isReady) return

			container.style.width = size[0] + 'px'
			container.style.height = size[1] + 'px'
			container.style.left = position[0] + 'px'
			container.style.top = position[1] + 'px'

			img.style.width = resizeVars.width + 'px'
			img.style.height = resizeVars.height + 'px'
			img.style.left = resizeVars.left + 'px'
			img.style.top = resizeVars.top + 'px'

			// img.style.width = resizeVars.width + 'px'
			// img.style.height = resizeVars.height + 'px'
			// img.style.left = resizeVars.left + 'px'
			// img.style.top = resizeVars.top + 'px'

			mCanvas.el.style.width = resizeVars.width + 'px'
			mCanvas.el.style.height = resizeVars.height + 'px'
			mCanvas.el.style.left = resizeVars.left + 'px'
			mCanvas.el.style.top = resizeVars.top + 'px'

		},
		clear: ()=> {
			dom.event.off(container, 'mouseenter', onMouseEnter)
			dom.event.off(container, 'mouseleave', onMouseLeave)
			dom.event.off(container, 'click', onClick)
		}
	}

	return scope

}