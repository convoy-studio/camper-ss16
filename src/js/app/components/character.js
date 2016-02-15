import AppStore from 'AppStore'

export default (holder, characterUrl, textureSize, onMouseOver, onMouseOut, onClick)=> {

	var scope;

	var tex = PIXI.Texture.fromImage(characterUrl)
	var sprite = new PIXI.Sprite(tex)
	sprite.anchor.x = sprite.anchor.y = 0.5
	holder.addChild(sprite)

	sprite.interactive = true
	sprite.buttonMode = true
	sprite.on('mouseover', onMouseOver)
	sprite.on('mouseout', onMouseOut)
	sprite.on('click', onClick)

	var mask = new PIXI.Graphics();
	holder.addChild(mask)

	sprite.mask = mask

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

			mask.clear()
			mask.beginFill(0xff0000, 1);
			mask.drawRect(0, 0, size[0], size[1]);
			mask.endFill();

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
			sprite.interactive = false
			sprite.buttonMode = false
			sprite.off('mouseover', onMouseOver)
			sprite.off('mouseout', onMouseOut)
			sprite.off('click', onClick)
			holder.removeChild(sprite)
			holder.removeChild(mask)
			mask.clear()
			sprite.destroy()
			sprite = null
			tex = null
		}
	}
	return scope
}