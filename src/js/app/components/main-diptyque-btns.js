import dom from 'dom-hand'
import AppStore from 'AppStore'
import img from 'img'
import Utils from 'Utils'
import AppConstants from 'AppConstants'

export default (container, data, mouse, onMouseEventsHandler, pxContainer)=> {

	var animParams = (s, dir, alpha)=> {
		var a = alpha || 1
		var tl = new TimelineMax()
		tl.fromTo(s.scale, 1, { x:1.7, y:1.3 }, { x:globalScale, y:globalScale, ease:Back.easeInOut}, 0)
		tl.fromTo(s, 1, { alpha:0, rotation:Math.PI*0.08*dir }, { alpha:a, rotation:0, ease:Expo.easeInOut}, 0)
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
	var shopSprite = {
		normal: undefined,
		shadow: undefined
	}
	var funSprite = {
		normal: undefined,
		shadow: undefined
	}
	var currentAnim;

	var shopImg = img(AppStore.baseMediaPath() + 'image/shop/'+AppStore.lang()+'.png', ()=> {
		
		var shadow = new PIXI.Sprite(PIXI.Texture.fromImage(AppStore.baseMediaPath() + 'image/shop/'+AppStore.lang()+'-shadow.png'))
		shadow.anchor.x = shadow.anchor.y = 0.5
		pxContainer.addChild(shadow)
		animParams(shadow, 1, 0.2)

		var sprite = new PIXI.Sprite(PIXI.Texture.fromImage(shopImg.src))
		sprite.anchor.x = sprite.anchor.y = 0.5
		pxContainer.addChild(sprite)
		animParams(sprite, -1)
		
		shopSprite.normal = sprite
		shopSprite.shadow = shadow
		shopSize = [shopImg.width, shopImg.height]
		
		scope.resize()
	})
	var funImg = img(AppStore.baseMediaPath() + 'image/fun-facts.png', ()=> {

		var shadow = new PIXI.Sprite(PIXI.Texture.fromImage(AppStore.baseMediaPath() + 'image/fun-facts-shadow.png'))
		shadow.anchor.x = shadow.anchor.y = 0.5
		pxContainer.addChild(shadow)
		animParams(shadow, -1, 0.2)

		var sprite = new PIXI.Sprite(PIXI.Texture.fromImage(funImg.src))
		sprite.anchor.x = sprite.anchor.y = 0.5
		pxContainer.addChild(sprite)
		animParams(sprite, 1)

		funSprite.normal = sprite
		funSprite.shadow = shadow
		funSize = [funImg.width, funImg.height]

		scope.resize()
	})

	dom.event.on(shopBtn, 'mouseenter', onMouseEventsHandler)
	dom.event.on(shopBtn, 'mouseleave', onMouseEventsHandler)
	dom.event.on(shopBtn, 'click', onMouseEventsHandler)
	dom.event.on(funBtn, 'mouseenter', onMouseEventsHandler)
	dom.event.on(funBtn, 'mouseleave', onMouseEventsHandler)
	dom.event.on(funBtn, 'click', onMouseEventsHandler)

	var updateAnim = (s, offset)=> {
		if(s == undefined) return
		s.time += 0.1
		s.fposition.x = s.iposition.x
		s.fposition.y = s.iposition.y
		s.fposition.x += (mouse.nX - 0.5) * (140 + offset)
		s.fposition.y += (mouse.nY - 0.5) * (200 + offset)

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
				
				shopSprite.normal.x = shopSprite.normal.iposition.x = shopSprite.shadow.x = shopSprite.shadow.iposition.x = midW >> 1
				shopSprite.normal.y = shopSprite.normal.iposition.y = shopSprite.shadow.y = shopSprite.shadow.iposition.y = windowH >> 1
				shopSprite.normal.scale.x = shopSprite.normal.scale.x = shopSprite.shadow.scale.x = shopSprite.shadow.scale.x = globalScale
			}
			if(funSize != undefined) {
				funBtn.style.width = buttonSize[0] + 'px'
				funBtn.style.height = buttonSize[1] + 'px'
				funBtn.style.left = midW + (midW >> 1) - (buttonSize[0] >> 1) + 'px'
				funBtn.style.top = (windowH >> 1) - (buttonSize[1] >> 1) + 'px'

				funSprite.normal.x = funSprite.normal.iposition.x = funSprite.shadow.x = funSprite.shadow.iposition.x = midW + (midW >> 1)
				funSprite.normal.y = funSprite.normal.iposition.y = funSprite.shadow.y = funSprite.shadow.iposition.y = windowH >> 1
				funSprite.normal.scale.x = funSprite.normal.scale.x = funSprite.shadow.scale.x = funSprite.shadow.scale.x = globalScale
			}
		},
		over: (id)=> {
			if(!scope.isActive) return
			currentAnim = (id == 'shop-btn') ? shopSprite : funSprite
			currentAnim.normal.tl.timeScale(2.8).play(0)
			currentAnim.shadow.tl.timeScale(2.8).play(0)
			currentAnim.normal.config.length = 400
			currentAnim.shadow.config.length = 400
		},
		out: (id)=> {
			if(!scope.isActive) return
			currentAnim = (id == 'shop-btn') ? shopSprite : funSprite
			currentAnim.normal.tl.timeScale(3.2).reverse()
			currentAnim.shadow.tl.timeScale(3.2).reverse()
		},
		update: ()=> {
			if(!scope.isActive) return
			if(shopSprite == undefined) return 
			updateAnim(shopSprite.normal, 0)
			updateAnim(funSprite.normal, 0)
			updateAnim(shopSprite.shadow, 100)
			updateAnim(funSprite.shadow, 100)
		},
		activate: ()=> {
			scope.isActive = true
		},
		disactivate: ()=> {
			scope.isActive = false
			shopSprite.normal.tl.timeScale(3).reverse()
			funSprite.normal.tl.timeScale(3).reverse()
			shopSprite.shadow.tl.timeScale(3).reverse()
			funSprite.shadow.tl.timeScale(3).reverse()
		},
		clear: ()=> {
			pxContainer.removeChild(shopSprite.normal)
			pxContainer.removeChild(funSprite.normal)
			pxContainer.removeChild(shopSprite.shadow)
			pxContainer.removeChild(funSprite.shadow)
			shopSprite.normal.tl.clear()
			funSprite.normal.tl.clear()
			shopSprite.shadow.tl.clear()
			funSprite.shadow.tl.clear()
			shopSprite.normal.destroy()
			funSprite.normal.destroy()
			shopSprite.shadow.destroy()
			funSprite.shadow.destroy()
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