import AppStore from 'AppStore'

export default (pxContainer, bgUrl)=> {

	var scope;

	var holder = new PIXI.Container()
	pxContainer.addChild(holder)

	var mask = new PIXI.Graphics();
	holder.addChild(mask)

	var bgTexture = PIXI.Texture.fromImage(bgUrl)
	var bgSprite = new PIXI.Sprite(bgTexture)
	bgSprite.anchor.x = bgSprite.anchor.y = 0.5
	holder.addChild(bgSprite)

	bgSprite.mask = mask

	scope = {
		holder: holder,
		bgSprite: bgSprite,
		resize: ()=> {

			var windowW = AppStore.Window.w
			var windowH = AppStore.Window.h

			var size = [(windowW >> 1) + 1, windowH]

			mask.clear()
			mask.beginFill(0xff0000, 1);
			mask.drawRect(0, 0, size[0], size[1]);
			mask.endFill();

			bgSprite.x = size[0] >> 1
			bgSprite.y = size[1] >> 1

		},
		clear: ()=> {
			pxContainer.removeChild(holder)
			mask.clear()
			bgSprite.destroy()
		}
	}
	return scope
}