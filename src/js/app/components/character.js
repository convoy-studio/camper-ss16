import AppStore from 'AppStore'

export default (holder, characterUrl, textureSize)=> {

	var scope;

	var tex = PIXI.Texture.fromImage(characterUrl)
	var sprite = new PIXI.Sprite(tex)
	sprite.anchor.x = sprite.anchor.y = 0.5
	holder.addChild(sprite)

	scope = {
		update: (mouse)=> {
			var windowW = AppStore.Window.w
			var nX = (( ( mouse.x - ( windowW >> 1) ) / ( windowW >> 1 ) ) * 1) - 0.5
			var nY = mouse.nY - 0.5
			var newx = sprite.ix + (10 * nX)
			var newy = sprite.iy + (10 * nY)
			sprite.x += (newx - sprite.x) * 0.03
			sprite.y += (newy - sprite.y) * 0.03
		},
		resize: ()=> {
			var windowW = AppStore.Window.w
			var windowH = AppStore.Window.h

			var size = [(windowW >> 1) + 1, windowH]

			setTimeout(()=> {
				var scale = ((windowH - 100) / textureSize.height) * 1
				sprite.scale.x = sprite.scale.y = scale
				sprite.x = size[0] >> 1
				sprite.y = size[1] - ((textureSize.height * scale) >> 1) + 10
				sprite.ix = sprite.x
				sprite.iy = sprite.y
			})
		},
		clear: ()=> {
			holder.removeChild(sprite)
			sprite.destroy()
			sprite = null
			tex = null
		}
	}
	return scope
}