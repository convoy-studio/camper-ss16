import dom from 'dom-hand'
import AppStore from 'AppStore'
import img from 'img'
import Utils from 'Utils'
import AppConstants from 'AppConstants'

export default (container, data, mouse, onMouseEventsHandler, pxContainer)=> {

	var animParams = (s, dir)=> {
		var tl = new TimelineMax()
		tl.fromTo(s.scale, 1, { x:1.7, y:1.3 }, { x:globalScale, y:globalScale, ease:Back.easeInOut}, 0)
		tl.fromTo(s, 1, { alpha:0, rotation:Math.PI*0.08*dir }, { alpha:1, rotation:0, ease:Expo.easeInOut}, 0)
		tl.pause(0)
		s.fposition = {x: 0, y: 0}
		s.iposition = {x: 0, y: 0}
		s.velocity = {x: 0, y: 0}
		s.time = 0
		s.tl = tl
		s.config = {
			length: 0,
			spring: 1.1,
			friction: 0.4
		}
	}

	var scope;
	var globalScale = 0.6
	var el = dom.select('.main-btns-wrapper', container)
	var shopBtn = dom.select('#shop-btn', el)
	var funBtn = dom.select('#fun-fact-btn', el)
	var shopSize, funSize;
	var loadCounter = 0
	var buttonSize = [0, 0]
	var springTo = Utils.SpringTo
	var shopSprite, funSprite, currentAnim;

	var shopImg = img(AppStore.baseMediaPath() + 'image/shop/'+AppStore.lang()+'.png', ()=> {
		var sprite = new PIXI.Sprite(PIXI.Texture.fromImage(shopImg.src))
		sprite.anchor.x = sprite.anchor.y = 0.5
		pxContainer.addChild(sprite)
		animParams(sprite, -1)
		shopSprite = sprite
		shopSize = [shopImg.width, shopImg.height]
		scope.resize()
	})
	var funImg = img(AppStore.baseMediaPath() + 'image/fun-facts.png', ()=> {
		var sprite = new PIXI.Sprite(PIXI.Texture.fromImage(funImg.src))
		sprite.anchor.x = sprite.anchor.y = 0.5
		pxContainer.addChild(sprite)
		animParams(sprite, 1)

		funSprite = sprite
		funSize = [funImg.width, funImg.height]

		scope.resize()
	})

	dom.event.on(shopBtn, 'mouseenter', onMouseEventsHandler)
	dom.event.on(shopBtn, 'mouseleave', onMouseEventsHandler)
	dom.event.on(shopBtn, 'click', onMouseEventsHandler)
	dom.event.on(funBtn, 'mouseenter', onMouseEventsHandler)
	dom.event.on(funBtn, 'mouseleave', onMouseEventsHandler)
	dom.event.on(funBtn, 'click', onMouseEventsHandler)

	var updateAnim = (s)=> {
		if(s == undefined) return
		s.time += 0.1
		s.fposition.x = s.iposition.x
		s.fposition.y = s.iposition.y
		s.fposition.x += (mouse.nX - 0.5) * 140
		s.fposition.y += (mouse.nY - 0.5) * 200

		springTo(s, s.fposition, 1)
		s.config.length += (0.01 - s.config.length) * 0.1
		
		s.x += s.velocity.x
		s.y += s.velocity.y
	}

	scope = {
		isActive: true,
		resize: ()=> {
			var windowW = AppStore.Window.w
			var windowH = AppStore.Window.h
			var midW = windowW >> 1
			
			buttonSize[0] = midW * 0.9
			buttonSize[1] = windowH

			if(shopSize != undefined) {
				shopBtn.style.width = buttonSize[0] + 'px'
				shopBtn.style.height = buttonSize[1] + 'px'
				shopBtn.style.left = (midW >> 1) - (buttonSize[0] >> 1) + 'px'
				shopBtn.style.top = (windowH >> 1) - (buttonSize[1] >> 1) + 'px'
				
				shopSprite.x = shopSprite.iposition.x = midW >> 1
				shopSprite.y = shopSprite.iposition.y = windowH >> 1

				shopSprite.scale.x = shopSprite.scale.x = globalScale
			}
			if(funSize != undefined) {
				funBtn.style.width = buttonSize[0] + 'px'
				funBtn.style.height = buttonSize[1] + 'px'
				funBtn.style.left = midW + (midW >> 1) - (buttonSize[0] >> 1) + 'px'
				funBtn.style.top = (windowH >> 1) - (buttonSize[1] >> 1) + 'px'

				funSprite.x = funSprite.iposition.x = midW + (midW >> 1)
				funSprite.y = funSprite.iposition.y = windowH >> 1
				funSprite.scale.x = funSprite.scale.x = globalScale
			}
		},
		over: (id)=> {
			if(!scope.isActive) return
			currentAnim = (id == 'shop-btn') ? shopSprite : funSprite
			currentAnim.tl.timeScale(2.8).play(0)
			currentAnim.config.length = 400
		},
		out: (id)=> {
			if(!scope.isActive) return
			currentAnim = (id == 'shop-btn') ? shopSprite : funSprite
			currentAnim.tl.timeScale(3.2).reverse()
		},
		update: ()=> {
			if(!scope.isActive) return
			if(shopSprite == undefined) return 
			updateAnim(shopSprite)
			updateAnim(funSprite)
		},
		activate: ()=> {
			scope.isActive = true
		},
		disactivate: ()=> {
			scope.isActive = false
			shopSprite.tl.timeScale(3).reverse()
			funSprite.tl.timeScale(3).reverse()
		},
		clear: ()=> {
			pxContainer.removeChild(shopSprite)
			pxContainer.removeChild(funSprite)
			shopSprite.tl.clear()
			funSprite.tl.clear()
			shopSprite.destroy()
			funSprite.destroy()
			dom.event.off(shopBtn, 'mouseenter', onMouseEventsHandler)
			dom.event.off(shopBtn, 'mouseleave', onMouseEventsHandler)
			dom.event.off(shopBtn, 'click', onMouseEventsHandler)
			dom.event.off(funBtn, 'mouseenter', onMouseEventsHandler)
			dom.event.off(funBtn, 'mouseleave', onMouseEventsHandler)
			dom.event.off(funBtn, 'click', onMouseEventsHandler)
			shopSprite = null
			funSprite = null
			currentAnim = null
		}
	}

	return scope

}