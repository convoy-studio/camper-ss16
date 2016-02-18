import dom from 'dom-hand'
import AppStore from 'AppStore'
import img from 'img'
import Utils from 'Utils'

export default (container, data, mouse, onMouseEventsHandler)=> {

	var animParams = (parent, el, imgWrapper)=> {
		var tl = new TimelineMax()
		tl.fromTo(imgWrapper, 1, {scaleX:1.7, scaleY:1.3, rotation:'2deg', y:-20, opacity:0, transformOrigin: '50% 50%', force3D:true }, { scaleX:1, scaleY:1, rotation:'0deg', y:0, opacity:1, transformOrigin: '50% 50%', force3D:true, ease:Back.easeInOut}, 0)
		tl.pause(0)
		return {
			parent: parent,
			imgWrapper: imgWrapper,
			tl: tl,
			el: el,
			time: 0,
			position: {x: 0, y: 0},
			fposition: {x: 0, y: 0},
			iposition: {x: 0, y: 0},
			// scale: {x: 0, y: 0},
			// fscale: {x: 0, y: 0},
			// iscale: {x: 0, y: 0},
			velocity: {x: 0, y: 0},
			// velocityScale: {x: 0, y: 0},
			rotation: 0,
			config: {
				length: 0,
				spring: 0.8,
				friction: 0.4
			}
		}
	}

	var scope;
	var el = dom.select('.main-btns-wrapper', container)
	var shopBtn = dom.select('#shop-btn', el)
	var funBtn = dom.select('#fun-fact-btn', el)
	var shopImgWrapper  = dom.select('.img-wrapper', shopBtn)
	var funImgWrapper = dom.select('.img-wrapper', funBtn)
	var shopSize, funSize;
	var loadCounter = 0
	var buttonSize = [0, 0]
	var springTo = Utils.SpringTo
	var translate = Utils.Translate
	var shopAnim, funAnim, currentAnim;
	var buttons = {
		'shop-btn': {
			anim: undefined
		},
		'fun-fact-btn': {
			anim: undefined
		}
	}

	var shopImg = img('image/shop.png', ()=> {
		shopAnim = animParams(shopBtn, shopImg, shopImgWrapper)
		buttons['shop-btn'].anim = shopAnim
		shopSize = [shopImg.width, shopImg.height]
		dom.tree.add(shopImgWrapper, shopImg)
		scope.resize()
	})
	var funImg = img('image/fun-facts.png', ()=> {
		funAnim = animParams(funBtn, funImg, funImgWrapper)
		buttons['fun-fact-btn'].anim = funAnim
		funSize = [funImg.width, funImg.height]
		dom.tree.add(funImgWrapper, funImg)
		scope.resize()
	})

	dom.event.on(shopBtn, 'mouseenter', onMouseEventsHandler)
	dom.event.on(shopBtn, 'mouseleave', onMouseEventsHandler)
	dom.event.on(shopBtn, 'click', onMouseEventsHandler)
	dom.event.on(funBtn, 'mouseenter', onMouseEventsHandler)
	dom.event.on(funBtn, 'mouseleave', onMouseEventsHandler)
	dom.event.on(funBtn, 'click', onMouseEventsHandler)

	var updateAnim = (anim)=> {
		if(anim == undefined) return
		anim.time += 0.1
		anim.fposition.x = anim.iposition.x
		anim.fposition.y = anim.iposition.y
		anim.fposition.x += (mouse.nX - 0.5) * 80
		anim.fposition.y += (mouse.nY - 0.5) * 200

		springTo(anim, anim.fposition, 1)
		anim.config.length += (0.01 - anim.config.length) * 0.1
		
		translate(anim.el, anim.position.x + anim.velocity.x, anim.position.y + anim.velocity.y, 1)
	}

	scope = {
		isActive: true,
		resize: ()=> {
			var windowW = AppStore.Window.w
			var windowH = AppStore.Window.h
			var midW = windowW >> 1
			var scale = 0.8
			
			buttonSize[0] = midW * 0.9
			buttonSize[1] = windowH

			if(shopSize != undefined) {
				shopBtn.style.width = buttonSize[0] + 'px'
				shopBtn.style.height = buttonSize[1] + 'px'
				shopBtn.style.left = (midW >> 1) - (buttonSize[0] >> 1) + 'px'
				shopBtn.style.top = (windowH >> 1) - (buttonSize[1] >> 1) + 'px'
				
				shopImgWrapper.style.width = shopSize[0]*scale + 'px'
				shopImgWrapper.style.height = shopSize[1]*scale + 'px'
				shopImgWrapper.style.left = (buttonSize[0] >> 1) - (shopSize[0]*scale >> 1) + 'px'
				shopImgWrapper.style.top = (buttonSize[1] >> 1) - (shopSize[1]*scale >> 1) + 'px'
			}
			if(funSize != undefined) {
				funBtn.style.width = buttonSize[0] + 'px'
				funBtn.style.height = buttonSize[1] + 'px'
				funBtn.style.left = midW + (midW >> 1) - (buttonSize[0] >> 1) + 'px'
				funBtn.style.top = (windowH >> 1) - (buttonSize[1] >> 1) + 'px'

				funImgWrapper.style.width = funSize[0]*scale + 'px'
				funImgWrapper.style.height = funSize[1]*scale + 'px'
				funImgWrapper.style.left = (buttonSize[0] >> 1) - (funSize[0]*scale >> 1) + 'px'
				funImgWrapper.style.top = (buttonSize[1] >> 1) - (funSize[1]*scale >> 1) + 'px'
			}
		},
		over: (id)=> {
			if(!scope.isActive) return
			currentAnim = buttons[id].anim
			currentAnim.tl.timeScale(2.6).play(0)
			currentAnim.config.length = 400
		},
		out: (id)=> {
			if(!scope.isActive) return
			currentAnim = buttons[id].anim
			currentAnim.tl.timeScale(3).reverse()
		},
		update: ()=> {
			if(!scope.isActive) return
			if(shopAnim == undefined) return 
			updateAnim(shopAnim)
			updateAnim(funAnim)
		},
		activate: ()=> {
			scope.isActive = true
		},
		disactivate: ()=> {
			scope.isActive = false
			shopAnim.tl.timeScale(3).reverse()
			funAnim.tl.timeScale(3).reverse()
		},
		clear: ()=> {
			shopAnim.tl.clear()
			funAnim.tl.clear()
			dom.event.off(shopBtn, 'mouseenter', onMouseEventsHandler)
			dom.event.off(shopBtn, 'mouseleave', onMouseEventsHandler)
			dom.event.off(shopBtn, 'click', onMouseEventsHandler)
			dom.event.off(funBtn, 'mouseenter', onMouseEventsHandler)
			dom.event.off(funBtn, 'mouseleave', onMouseEventsHandler)
			dom.event.off(funBtn, 'click', onMouseEventsHandler)
			shopAnim = null
			funAnim = null
			buttons = null
		}
	}

	return scope

}