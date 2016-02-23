import AppStore from 'AppStore'
import AppConstants from 'AppConstants'
import coloryRects from 'colory-rects'
import miniVideo from 'mini-video'
import dom from 'dom-hand'
import Utils from 'Utils'
import colorUtils from 'color-utils'
import AppActions from 'AppActions'

export default (pxContainer, parent, mouse, data, props)=> {
	var scope;
	var isReady = false
	var onCloseTimeout;
	var el = dom.select('.fun-fact-wrapper', parent)
	var videoWrapper = dom.select('.video-wrapper', el)
	var messageWrapper = dom.select('.message-wrapper', el)
	var messageInner = dom.select('.message-inner', messageWrapper)
	var pr = props;
	var tlTimeout;
	var firstResize = true;
	var containerScale = 3;

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
		AppActions.closeFunFact()
	}

	var open = ()=> {
		el.style['z-index'] = 29
		scope.isOpen = true
		scope.leftRects.open()
		scope.rightRects.open()
		var delay = 350
		setTimeout(()=>leftTl.timeScale(1.5).play(0), delay)
		setTimeout(()=>rightTl.timeScale(1.5).play(0), delay)
		setTimeout(()=>mVideo.play(), delay+200)
		clearTimeout(onCloseTimeout)
		onCloseTimeout = setTimeout(()=>dom.event.on(parent, 'click', onCloseFunFact), delay+200)
		parent.style.cursor = 'none'
		dom.classes.add(cross.el, 'active')
	}
	var close = ()=> {
		el.style['z-index'] = 27
		scope.isOpen = false
		scope.leftRects.close()
		scope.rightRects.close()
		var delay = 50
		setTimeout(()=>leftTl.timeScale(2).reverse(), delay)
		setTimeout(()=>rightTl.timeScale(2).reverse(), delay)
		parent.style.cursor = 'auto'
		dom.event.off(parent, 'click', onCloseFunFact)
		dom.classes.remove(cross.el, 'active')
	}

	var resizeInnerSize = (wW, wH)=> {
		var messageInnerSize = dom.size(messageInner)
		if(!scope.isOpen) messageInnerSize[1] = messageInnerSize[1]/containerScale
		console.log(messageInnerSize)
		messageInner.style.left = ((wW>>1) >> 1) - (messageInnerSize[0] >> 1) + 'px'
		messageInner.style.top = (wH >> 1) - (messageInnerSize[1] >> 1) + 'px'
	}

	scope = {
		isOpen: false,
		open: open,
		close: close,
		leftRects: leftRects,
		rightRects: rightRects,
		resize: ()=>{
			var windowW = AppStore.Window.w
			var windowH = AppStore.Window.h
			var midWindowW = (windowW >> 1)

			var size = [midWindowW + 1, windowH]

			scope.leftRects.resize(size[0], size[1], AppConstants.TOP)
			scope.rightRects.resize(size[0], size[1], AppConstants.BOTTOM)
			scope.rightRects.holder.x = windowW / 2
				
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

			setTimeout(()=>{
				resizeInnerSize(windowW, windowH)
			}, 10)

			clearTimeout(tlTimeout)
			tlTimeout = setTimeout(()=> {

				leftTl.clear()
				rightTl.clear()

				leftTl.fromTo(messageWrapper, 1.4, { y:windowH, scaleY:containerScale, transformOrigin:'50% 0%' }, { y:0, scaleY:1, transformOrigin:'50% 0%', force3D:true, ease:Expo.easeInOut }, 0)
				leftTl.staggerFromTo(splitter.words, 1, { y:1600, scaleY:6, force3D:true }, { y:0, scaleY:1, force3D:true, ease:Expo.easeOut }, 0.06, 0.2)
				rightTl.fromTo(videoWrapper, 1.4, { y:-windowH*2, scaleY:containerScale, transformOrigin:'50% 100%' }, { y:0, scaleY:1, transformOrigin:'50% 100%', force3D:true, ease:Expo.easeInOut }, 0)

				leftTl.pause(0)
				rightTl.pause(0)
				messageWrapper.style.opacity = 1
				videoWrapper.style.opacity = 1

				if(scope.isOpen) {
					leftTl.pause(leftTl.totalDuration())
					rightTl.pause(rightTl.totalDuration())
				}else{
					leftTl.pause(0)
					rightTl.pause(0)
				}
				firstResize = false
			}, 5)

		},
		update: ()=> {
			if(!scope.isOpen) return
			var newx = mouse.x - (cross.size[0] >> 1)
			var newy = mouse.y - (cross.size[1] >> 1)
			cross.x += (newx - cross.x) * 0.5
			cross.y += (newy - cross.y) * 0.5

			if(mouse.y > 70) {
				parent.style.cursor = 'none'
				cross.el.style.opacity = 1
			}else{
				parent.style.cursor = 'auto'
				cross.el.style.opacity = 0
			}
			Utils.Translate(cross.el, cross.x, cross.y, 1)
		},
		clear: ()=> {
			dom.event.off(parent, 'click', onCloseFunFact)
			dom.classes.remove(cross.el, 'active')
			pxContainer.removeChild(holder)
			leftTl.clear()
			rightTl.clear()
			scope.leftRects.clear()
			scope.rightRects.clear()
			scope.leftRects = null
			scope.rightRects = null
			leftTl = null
			rightTl = null
			holder = null
		}
	}
	return scope
}