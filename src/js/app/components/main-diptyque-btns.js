import dom from 'dom-hand'
import AppStore from 'AppStore'
import img from 'img'
import Utils from 'Utils'

export default (container, data, mouse, onMouseEventsHandler)=> {

	var animParams = (parent, el, dir)=> {
		// state
		// over, out
		return {
			state: 'out',
			parent: parent,
			el: el,
			dir: dir,
			time: 0,
			position: {x: 0, y: 0},
			fposition: {x: 0, y: 0},
			iposition: {x: 0, y: 0},
			scale: {x: 0, y: 0},
			fscale: {x: 0, y: 0},
			iscale: {x: 0, y: 0},
			velocity: {x: 0, y: 0},
			velocityScale: {x: 0, y: 0},
			rotation: 0,
			config: {
				length: 0,
				spring: 0.4,
				friction: 0.7
			}
		}
	}

	var scope;
	var el = dom.select('.main-btns-wrapper', container)
	var shopBtn = dom.select('#shop-btn', el)
	var funBtn = dom.select('#fun-fact-btn', el)
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
		shopAnim = animParams(shopBtn, shopImg, 1)
		buttons['shop-btn'].anim = shopAnim
		shopSize = [shopImg.width, shopImg.height]
		dom.tree.add(shopBtn, shopImg)
		scope.resize()
	})
	var funImg = img('image/fun-facts.png', ()=> {
		funAnim = animParams(funBtn, funImg, -1)
		buttons['fun-fact-btn'].anim = funAnim
		funSize = [funImg.width, funImg.height]
		dom.tree.add(funBtn, funImg)
		scope.resize()
	})

	dom.event.on(shopBtn, 'mouseenter', onMouseEventsHandler)
	dom.event.on(shopBtn, 'mouseleave', onMouseEventsHandler)
	dom.event.on(shopBtn, 'click', onMouseEventsHandler)
	dom.event.on(funBtn, 'mouseenter', onMouseEventsHandler)
	dom.event.on(funBtn, 'mouseleave', onMouseEventsHandler)
	dom.event.on(funBtn, 'click', onMouseEventsHandler)

	var updateAnim = (anim)=> {
		anim.time += 0.1
		anim.fposition.x = anim.iposition.x
		anim.fposition.y = anim.iposition.y
		anim.fposition.x += (mouse.nX - 0.5) * 6 * anim.dir
		anim.fposition.y += (mouse.nY - 0.5) * 12 * anim.dir

		springTo(anim, anim.fposition, 1)
		anim.config.length += (0.01 - anim.config.length) * 0.05
		
		translate(anim.el, anim.position.x + anim.velocity.x, anim.position.y + anim.velocity.y, 1)
	}

	scope = {
		resize: ()=> {
			var windowW = AppStore.Window.w
			var windowH = AppStore.Window.h
			var midW = windowW >> 1
			var scale = 0.8
			
			buttonSize[0] = midW * 0.6
			buttonSize[1] = windowH * 0.8

			if(shopSize != undefined) {
				shopBtn.style.width = buttonSize[0] + 'px'
				shopBtn.style.height = buttonSize[1] + 'px'
				shopBtn.style.left = (midW >> 1) - (buttonSize[0] >> 1) + 'px'
				shopBtn.style.top = (windowH >> 1) - (buttonSize[1] >> 1) + 'px'
				
				shopImg.style.width = shopSize[0]*scale + 'px'
				shopImg.style.height = shopSize[1]*scale + 'px'
				shopImg.style.left = (buttonSize[0] >> 1) - (shopSize[0]*scale >> 1) + 'px'
				shopImg.style.top = (buttonSize[1] >> 1) - (shopSize[1]*scale >> 1) + 'px'
			}
			if(funSize != undefined) {
				funBtn.style.width = buttonSize[0] + 'px'
				funBtn.style.height = buttonSize[1] + 'px'
				funBtn.style.left = midW + (midW >> 1) - (buttonSize[0] >> 1) + 'px'
				funBtn.style.top = (windowH >> 1) - (buttonSize[1] >> 1) + 'px'

				funImg.style.width = funSize[0]*scale + 'px'
				funImg.style.height = funSize[1]*scale + 'px'
				funImg.style.left = (buttonSize[0] >> 1) - (funSize[0]*scale >> 1) + 'px'
				funImg.style.top = (buttonSize[1] >> 1) - (funSize[1]*scale >> 1) + 'px'
			}
		},
		over: (id)=> {
			currentAnim = buttons[id].anim
		},
		out: (id)=> {
			currentAnim = buttons[id].anim
		},
		update: ()=> {
			if(shopAnim == undefined) return 
			updateAnim(shopAnim)
			updateAnim(funAnim)
		},
		clear: ()=> {
			dom.event.off(shopBtn, 'mouseenter', onMouseEventsHandler)
			dom.event.off(shopBtn, 'mouseleave', onMouseEventsHandler)
			dom.event.off(shopBtn, 'click', onMouseEventsHandler)
			dom.event.off(funBtn, 'mouseenter', onMouseEventsHandler)
			dom.event.off(funBtn, 'mouseleave', onMouseEventsHandler)
			dom.event.off(funBtn, 'click', onMouseEventsHandler)
		}
	}

	return scope

}