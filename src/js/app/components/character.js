import AppStore from 'AppStore'

export default (holder, characterUrl)=> {

	var scope;

	var tex = PIXI.Texture.fromImage(characterUrl)
	var sprite = new PIXI.Sprite(tex)
	sprite.anchor.x = sprite.anchor.y = 0.5
	holder.addChild(sprite)

	scope = {
		resize: ()=> {
			var windowW = AppStore.Window.w
			var windowH = AppStore.Window.h

			var size = [(windowW >> 1) + 1, windowH]

			setTimeout(()=> {
				var source = tex.baseTexture.source
				var scale = ((windowH - 100) / source.height) * 1
				sprite.scale.x = sprite.scale.y = scale
				sprite.x = size[0] >> 1
				sprite.y = size[1] - ((source.height * scale) >> 1)

				console.log(scale)
			})
		}
	}
	return scope
}