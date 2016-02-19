import AppStore from 'AppStore'
import Utils from 'Utils'
import AppConstants from 'AppConstants'

export default (pxContainer, bgUrl)=> {

	var scope;

	var holder = new PIXI.Container()
	pxContainer.addChild(holder)

	var mask = new PIXI.Graphics();
	holder.addChild(mask)

	var bgTexture = PIXI.Texture.fromImage(bgUrl)
	var sprite = new PIXI.Sprite(bgTexture)
	sprite.anchor.x = sprite.anchor.y = 0.5
	holder.addChild(sprite)

	sprite.mask = mask

	scope = {
		holder: holder,
		bgSprite: sprite,
		update: (mouse)=> {
			var windowW = AppStore.Window.w
			var nX = (( ( mouse.x - ( windowW >> 1) ) / ( windowW >> 1 ) ) * 1) - 0.5
			var nY = mouse.nY - 0.5
			var newx = sprite.ix - (30 * nX)
			var newy = sprite.iy - (20 * nY)
			sprite.x += (newx - sprite.x) * 0.008
			sprite.y += (newy - sprite.y) * 0.008
		},
		resize: ()=> {

			var windowW = AppStore.Window.w
			var windowH = AppStore.Window.h

			var size = [(windowW >> 1) + 1, windowH]

			mask.clear()
			mask.beginFill(0xff0000, 1);
			mask.drawRect(0, 0, size[0], size[1]);
			mask.endFill();

			var resizeVars = Utils.ResizePositionProportionally(size[0], size[1], 960, 1024)

			sprite.x = size[0] >> 1
			sprite.y = size[1] >> 1
			sprite.scale.x = sprite.scale.y = resizeVars.scale + 0.1
			sprite.ix = sprite.x
			sprite.iy = sprite.y

		},
		clear: ()=> {
			pxContainer.removeChild(holder)
			holder.removeChild(mask)
			holder.addChild(sprite)
			mask.clear()
			sprite.destroy()
			holder = null
			mask = null
			sprite = null
		}
	}
	return scope
}