import AppStore from 'AppStore'
import dom from 'dom-hand'
import miniVideo from 'mini-video'
import Router from 'Router'
import AppActions from 'AppActions'

export default (container, front, videoUrl)=> {

	var scope;
	var splitter = videoUrl.split('/')
	var name = splitter[splitter.length-1].split('.')[0]
	var nameSplit = name.split('-')
	var nameParts = nameSplit.length == 3 ? [nameSplit[0]+'-'+nameSplit[1], nameSplit[2]] : nameSplit
	var imgId = 'home-video-shots/' + name
	var mVideo = miniVideo({
		loop: true,
		autoplay: false
	})
	var size, position, resizeVideoVars, resizeImageVars;
	var img;
	var isMouseEnter = false;

	var onMouseEnter = (e)=> {
		e.preventDefault()
		isMouseEnter = true
		AppActions.cellMouseEnter(nameParts)
		if(mVideo.isLoaded) {
			dom.classes.add(container, 'over')
			mVideo.play(0)
		}else{
			mVideo.load(videoUrl, ()=> {
				if(!isMouseEnter) return
				dom.classes.add(container, 'over')
				mVideo.play()
			})
		}
	}

	var onMouseLeave = (e)=> {
		e.preventDefault()
		isMouseEnter = false
		dom.classes.remove(container, 'over')
		AppActions.cellMouseLeave(nameParts)
		mVideo.pause(0)
	}

	var onClick = (e)=> {
		e.preventDefault()
		Router.setHash(nameParts[0] + '/' + nameParts[1])
	}

	var init = ()=> {
		var imgUrl = AppStore.Preloader.getImageURL(imgId) 
		img = document.createElement('img')
		img.src = imgUrl
		dom.tree.add(container, img)
		dom.tree.add(container, mVideo.el)

		dom.event.on(front, 'mouseenter', onMouseEnter)
		dom.event.on(front, 'mouseleave', onMouseLeave)
		dom.event.on(front, 'click', onClick)

		scope.isReady = true
	}

	scope = {
		isReady: false,
		init: init,
		resize: (s, p, rvv, riv)=> {

			size = s == undefined ? size : s
			position = p == undefined ? position : p
			resizeVideoVars = rvv == undefined ? resizeVideoVars : rvv
			resizeImageVars = riv == undefined ? resizeImageVars : riv

			if(!scope.isReady) return

			container.style.width = front.style.width = size[0] + 'px'
			container.style.height = front.style.height = size[1] + 'px'
			container.style.left = front.style.left = position[0] + 'px'
			container.style.top = front.style.top = position[1] + 'px'

			img.style.width = resizeImageVars.width + 'px'
			img.style.height = resizeImageVars.height + 'px'
			img.style.left = resizeImageVars.left + 'px'
			img.style.top = resizeImageVars.top + 'px'

			mVideo.el.style.width = resizeVideoVars.width + 'px'
			mVideo.el.style.height = resizeVideoVars.height + 'px'
			mVideo.el.style.left = resizeVideoVars.left + 'px'
			mVideo.el.style.top = resizeVideoVars.top + 'px'

		},
		clear: ()=> {
			mVideo.clear()
			dom.event.off(front, 'mouseenter', onMouseEnter)
			dom.event.off(front, 'mouseleave', onMouseLeave)
			dom.event.off(front, 'click', onClick)
			mVideo = null
		}
	}

	return scope

}