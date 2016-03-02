import img from 'img'
import dom from 'dom-hand'
import AppStore from 'AppStore'
import AppConstants from 'AppConstants'
import Utils from 'Utils'

export default (container, pxContainer, displacementUrl)=> {

	var scope;
	var el = dom.select('.grid-background-container', container)
	var holder = new PIXI.Container()
	var sprite = new PIXI.Sprite()
	var texture;
	pxContainer.addChild(holder)
	holder.addChild(sprite)
	var onImgLoadedCallback;
	var grid;
	var image;
	var isReady = false
	var anim = {
		ix:0,
		iy:0,
		x:0,
		y:0
	}
	var displacement = {
		sprite: new PIXI.Sprite.fromImage(displacementUrl),
		filter: undefined,
		tween: undefined
	}
	displacement.sprite.anchor.x = displacement.sprite.anchor.y = 0.5
	displacement.filter = new PIXI.filters.DisplacementFilter(displacement.sprite)
	pxContainer.addChild(displacement.sprite)
	holder.filters = [displacement.filter]

	var onCellMouseEnter = (item)=> {
		displacement.tween.play(0)
	}
	AppStore.on(AppConstants.CELL_MOUSE_ENTER, onCellMouseEnter)

	var onImgReady = (error, i)=> {
		var texture = PIXI.Texture.fromImage(i.src);
		sprite.texture = texture
		sprite.anchor.x = sprite.anchor.y = 0.5
		image = i
		image.style.opacity = 0
		dom.tree.add(el, image)
		isReady = true
		scope.resize(grid)
		if(onImgLoadedCallback) onImgLoadedCallback()
	}

	scope = {
		sprite: sprite,
		el: el,
		resize: (gGrid)=> {
			var windowW = AppStore.Window.w
			var windowH = AppStore.Window.h

			grid = gGrid

			if(!isReady) return

			var resizeVarsBg = Utils.ResizePositionProportionally(windowW*1.1, windowH*1.1, AppConstants.MEDIA_GLOBAL_W, AppConstants.MEDIA_GLOBAL_H)
			var resizeVarsDisplacement = Utils.ResizePositionProportionally(windowW*1.1, windowH*1.1, 500, 500)

			image.style.position = 'absolute'
			image.style.width = resizeVarsBg.width + 'px'
			image.style.height = resizeVarsBg.height + 'px'
			image.style.top = resizeVarsBg.top - 10 + 'px'
			image.style.left = resizeVarsBg.left - 20 + 'px'

			sprite.x = anim.ix = windowW >> 1
			sprite.y = anim.iy = windowH >> 1
			sprite.width = resizeVarsBg.width
			sprite.height = resizeVarsBg.height

			displacement.sprite.width = resizeVarsDisplacement.width
			displacement.sprite.height = resizeVarsDisplacement.height

			displacement.tween = TweenMax.fromTo(displacement.sprite.scale, 4, { x:0, y:0 }, { x:4, y:4, ease:Expo.easeOut })
			displacement.tween.pause(0)
		},
		update: (mouse)=> {

			var newx = anim.ix + ((mouse.nX-0.5)*40)
			var newy = anim.iy + ((mouse.nY-0.5)*40)
			sprite.x += (newx - sprite.x) * 0.05
			sprite.y += (newy - sprite.y) * 0.05

			anim.x += (((mouse.nX-0.5)*40) - anim.x) * 0.05
			anim.y += (((mouse.nY-0.5)*40) - anim.y) * 0.05
			Utils.Translate(image, anim.x-10, anim.y-10, 1)

			displacement.sprite.x = mouse.x
			displacement.sprite.y = mouse.y

		},
		load: (url, cb)=> {
			onImgLoadedCallback = cb
			img(url, onImgReady)
		},
		switchCanvasToDom: ()=> {
			TweenMax.to(image, 0.08, { opacity:1, ease:Expo.easeOut })
			TweenMax.to(holder, 0.1, { alpha:0, ease:Expo.easeOut })
		},
		clear: ()=> {
			AppStore.off(AppConstants.CELL_MOUSE_ENTER, onCellMouseEnter)
			pxContainer.removeChild(holder)
			pxContainer.removeChild(displacement.sprite)
			holder.removeChild(sprite)
			displacement.sprite.destroy()
			displacement.tween = null
			holder.destroy()
			sprite.destroy()
			displacement.sprite = null
			displacement = null
			sprite = null
			holder = null
			image = null
			el = null
		}
	}

	return scope

}