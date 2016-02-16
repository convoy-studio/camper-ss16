import AppStore from 'AppStore'
import AppConstants from 'AppConstants'
import coloryRects from 'colory-rects'
import miniVideo from 'mini-video'
import dom from 'dom-hand'
import Utils from 'Utils'
import colorUtils from 'color-utils'

export default (pxContainer, parent, mouse, data)=> {
	var scope;
	var isReady = false
	var el = dom.select('.fun-fact-wrapper', parent)
	var videoWrapper = dom.select('.video-wrapper', el)
	var messageWrapper = dom.select('.message-wrapper', el)
	var messageInner = dom.select('.message-inner', messageWrapper)

	var splitter = new SplitText(messageInner, {type:"words"})

	var c = dom.select('.cursor-cross', el)
	var cross = {
		x: 0,
		y: 0,
		el: c,
		size: dom.size(c)
	}

	var holder = new PIXI.Container()
	pxContainer.addChild(holder)

	var leftRects = coloryRects(holder, data['ambient-color'])
	var rightRects = coloryRects(holder, data['ambient-color'])

	var mBgColor = data['ambient-color'].to
	messageWrapper.style.backgroundColor = '#' + colorUtils.hsvToHex(mBgColor.h, mBgColor.s, mBgColor.v)

	var leftTl = new TimelineMax()
	var rightTl = new TimelineMax()

	var mVideo = miniVideo({
		autoplay: false,
		loop: true
	})
	var videoSrc = data['fun-fact-video-url']
	mVideo.addTo(videoWrapper)
	mVideo.load(videoSrc, ()=> {
		isReady = true
		scope.resize()
	})

	var onCloseFunFact = ()=> {
		if(!scope.isOpen) return
		scope.close()
	}

	var open = ()=> {
		scope.isOpen = true
		leftRects.open()
		rightRects.open()
		var delay = 350
		setTimeout(()=>leftTl.timeScale(1.5).play(0), delay)
		setTimeout(()=>rightTl.timeScale(1.5).play(0), delay)
		setTimeout(()=>mVideo.play(), delay+200)
		parent.style.cursor = 'none'
		dom.event.on(parent, 'click', onCloseFunFact)
		dom.classes.add(cross.el, 'active')
	}
	var close = ()=> {
		scope.isOpen = false
		leftRects.close()
		rightRects.close()
		var delay = 50
		setTimeout(()=>leftTl.timeScale(2).reverse(), delay)
		setTimeout(()=>rightTl.timeScale(2).reverse(), delay)
		parent.style.cursor = 'auto'
		dom.event.off(parent, 'click', onCloseFunFact)
		dom.classes.remove(cross.el, 'active')
	}

	scope = {
		isOpen: false,
		open: open,
		close: close,
		resize: ()=>{
			var windowW = AppStore.Window.w
			var windowH = AppStore.Window.h
			var midWindowW = (windowW >> 1)


			var size = [midWindowW + 1, windowH]

			leftRects.resize(size[0], size[1], AppConstants.TOP)
			rightRects.resize(size[0], size[1], AppConstants.BOTTOM)
			rightRects.holder.x = windowW / 2
				
			// if video isn't ready return
			if(!isReady) return

			var videoWrapperResizeVars = Utils.ResizePositionProportionally(midWindowW, windowH, AppConstants.MEDIA_GLOBAL_W >> 1, AppConstants.MEDIA_GLOBAL_H)

			videoWrapper.style.width = messageWrapper.style.width = midWindowW + 'px'
			videoWrapper.style.height = messageWrapper.style.height = windowH + 'px'
			videoWrapper.style.left = midWindowW + 'px'
			mVideo.el.style.width = videoWrapperResizeVars.width + 'px'
			mVideo.el.style.height = videoWrapperResizeVars.height + 'px'
			mVideo.el.style.top = videoWrapperResizeVars.top + 'px'
			mVideo.el.style.left = videoWrapperResizeVars.left + 'px'

			setTimeout(()=> {
				var messageInnerSize = dom.size(messageInner)
				messageInner.style.left = (midWindowW >> 1) - (messageInnerSize[0] >> 1) + 'px'
				messageInner.style.top = (windowH >> 1) - (messageInnerSize[1] >> 1) + 'px'
			}, 0)

			setTimeout(()=> {
				leftTl.clear()
				rightTl.clear()

				leftTl.fromTo(messageWrapper, 1.4, { y:windowH, scaleY:3, transformOrigin:'50% 0%' }, { y:0, scaleY:1, transformOrigin:'50% 0%', force3D:true, ease:Expo.easeInOut }, 0)
				leftTl.staggerFrom(splitter.words, 1, { y:1400, scaleY:6, force3D:true, ease:Expo.easeOut }, 0.06, 0.2)
				rightTl.fromTo(videoWrapper, 1.4, { y:-windowH*2, scaleY:3, transformOrigin:'50% 100%' }, { y:0, scaleY:1, transformOrigin:'50% 100%', force3D:true, ease:Expo.easeInOut }, 0)

				leftTl.pause(0)
				rightTl.pause(0)
			}, 5)

		},
		update: ()=> {
			if(!scope.isOpen) return
			var newx = mouse.x - (cross.size[0] >> 1)
			var newy = mouse.y - (cross.size[1] >> 1)
			cross.x += (newx - cross.x) * 0.5
			cross.y += (newy - cross.y) * 0.5
			Utils.Translate(cross.el, cross.x, cross.y, 1)
		},
		clear: ()=> {
			pxContainer.removeChild(holder)
			leftRects.clear()
			leftRects = null
			rightRects.clear()
			rightRects = null
			holder = null
		}
	}
	return scope
}