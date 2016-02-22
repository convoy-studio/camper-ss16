import dom from 'dom-hand'
import AppStore from 'AppStore'
import img from 'img'
import AppConstants from 'AppConstants'
import Utils from 'Utils'
import miniVideo from 'mini-video'
import colorUtils from 'color-utils'

export default (holder, mouse, data)=> {

	var scope;
	var isReady = false
	var screenHolderSize = [0, 0], videoHolderSize = [0, 0], colorifierSize = [0, 0], topOffset = 0;
	var el = dom.select('.selfie-stick-wrapper', holder)
	var background = dom.select('.background', el)
	var screenWrapper = dom.select('.screen-wrapper', el)
	var screenHolder = dom.select('.screen-holder', screenWrapper)
	var videoHolder = dom.select('.video-holder', screenWrapper)
	var colorifier = dom.select('.colorifier', screenWrapper)
	var colorifierSvgPath = dom.select('svg path', colorifier)
	var selfieStickWrapper = dom.select('.selfie-stick-wrapper', el)
	var springTo = Utils.SpringTo
	var translate = Utils.Translate
	var tweenIn;
	var animation = {
		position: {x: 0, y: 0},
		fposition: {x: 0, y: 0},
		iposition: {x: 0, y: 0},
		velocity: {x: 0, y: 0},
		rotation: 0,
		config: {
			length: 400,
			spring: 0.4,
			friction: 0.7
		}
	}

	TweenMax.set(el, { rotation: '-1deg', transformOrigin:'50% 100%' })

	// check if mix-blend-mode is available
	if ('mix-blend-mode' in colorifier.style) {
		// check if safari because color filter isn't working on it
		if(AppStore.Detector.isSafari) {
			colorifier.style['mix-blend-mode'] = 'multiply'
		}else{
			colorifier.style['mix-blend-mode'] = 'color'
		}
	}else{
		colorifierSvgPath.style['opacity'] = 0.8
	}
	
	var c = data['ambient-color']['selfie-stick']
	colorifierSvgPath.style['fill'] = '#' + colorUtils.hsvToHex(c.h, c.s, c.v)

	var onVideoEnded = ()=> {
		scope.close()
	}
	var mVideo = miniVideo({
		autoplay: false
	})
	mVideo.addTo(videoHolder)
	mVideo.on('ended', onVideoEnded)
	var videoSrc = data['selfie-stick-video-url']

	var stickImg = img(AppStore.baseMediaPath() + 'image/selfiestick.png', ()=> {
		dom.tree.add(screenHolder, stickImg)

		mVideo.load(videoSrc, ()=> {
			if(tweenIn != undefined){
				tweenIn.play()
			}
			isReady = true
			scope.resize()
		})
	})

	scope = {
		el: el,
		isOpened: false,
		open: ()=> {
			animation.config.length = 100,
			animation.config.spring = 0.9,
			animation.config.friction = 0.5
			mVideo.play(0)
			background.style.visibility = 'visible'
			scope.isOpened = true
		},
		close: ()=> {
			animation.config.length = 0,
			animation.config.spring = 0.6,
			animation.config.friction = 0.7
			mVideo.pause(0)
			background.style.visibility = 'hidden'
			scope.isOpened = false
		},
		update: ()=> {

			if(scope.isOpened) {
				animation.fposition.x = animation.iposition.x
				animation.fposition.y = animation.iposition.y - (screenHolderSize[1] * 0.8)
				animation.fposition.x += (mouse.nX - 0.5) * 80
				animation.fposition.y += (mouse.nY - 0.5) * 30
			}else{
				animation.fposition.x = animation.iposition.x
				animation.fposition.y = animation.iposition.y
				animation.fposition.x += (mouse.nX - 0.5) * 20
				animation.fposition.y -= (mouse.nY - 0.5) * 20
			}

			springTo(animation, animation.fposition, 1)

			animation.position.x += (animation.fposition.x - animation.position.x) * 0.1

			animation.config.length += (0.01 - animation.config.length) * 0.05

			translate(screenWrapper, animation.position.x, animation.position.y + animation.velocity.y, 1)
		},
		resize: ()=> {
			var windowW = AppStore.Window.w
			var windowH = AppStore.Window.h
				
			// if images not ready return
			if(!isReady) return

			screenWrapper.style.width = windowW * 0.3 + 'px'

			background.style.width = windowW + 'px'
			background.style.height = windowH + 'px'

			screenHolderSize = dom.size(screenHolder)
			videoHolderSize = dom.size(videoHolder)
			colorifierSize = dom.size(colorifier)
			topOffset = (windowW / AppConstants.MEDIA_GLOBAL_W) * 26
			videoHolder.style.left = (screenHolderSize[0] >> 1) - (videoHolderSize[0] >> 1) + 'px'
			videoHolder.style.top = topOffset + 'px'
			colorifier.style.left = (screenHolderSize[0] >> 1) - (colorifierSize[0] * 0.58) + 'px'
			colorifier.style.top = -0.7 + 'px'

			animation.iposition.x = (windowW >> 1) - (screenHolderSize[0] >> 1)
			animation.iposition.y = windowH - (videoHolderSize[1] * 0.35)
			animation.position.x = animation.iposition.x
			animation.position.y = animation.iposition.y

			if(el.style.opacity != 1) {
				setTimeout(()=> { el.style.opacity = 1 }, 500)
			}
		},
		transitionInCompleted: ()=> {
			if(!isReady) {
				tweenIn = TweenMax.from(el, 0.6, { y: 500, paused:true, ease:Back.easeOut, force3D:true })
			}
		},
		clear: ()=> {
			mVideo.clear()
			mVideo = null
			animation = null
			tweenIn = null
		}
	}

	scope.close()

	return scope

}