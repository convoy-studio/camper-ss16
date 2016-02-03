import AppStore from 'AppStore'
import gridPositions from 'grid-positions'
import img from 'img'
import Utils from 'Utils'
import AppConstants from 'AppConstants'

export default (parent)=> {
	var scope;

	var urls = AppStore.diptyqueShoes()
	var loaded = 0
	var sprites = []
	var grid;
	var bigImgW = 0
	var allImgLoaded = false

	var holder = new PIXI.Container()
	parent.addChild(holder)

	var bg = new PIXI.Graphics()
	holder.addChild(bg)

	var shoesHolder = new PIXI.Container()
	holder.addChild(shoesHolder)

	var sprites = []
	for (var i = 0; i < urls.length; i++) {
		var url = urls[i]
		var id = Utils.GetImgUrlId(url)
		var c = new PIXI.Container()
		var sprt = new PIXI.Sprite()
		c.addChild(sprt)
		shoesHolder.addChild(c)
		sprites[i] = {
			url: url,
			id: id,
			container: c,
			sprite: sprt
		}
	};

	var getSpriteById = (id)=> {
		for (var i = 0; i < sprites.length; i++) {
			var sprt = sprites[i]
			if(id == sprt.id) return sprt
		};
	}

	var setupSprites = ()=> {
		for (var i = 0; i < urls.length; i++) {
			var tex = PIXI.Texture.fromImage(urls[i])
			var c = new PIXI.Container()
			// var sprite = new PIXI.Sprite(tex)
			var sprite = sprites[i].sprite
			sprite.texture = tex
			sprites[i].container.addChild(sprite)
			sprite.anchor.x = sprite.anchor.y = 0.5
			// sprites[i].sprite = sprite
		}
	}

	var resizeSprites = ()=> {
		var positions = grid.positions
		for (var i = 0; i < sprites.length; i++) {
			var container = sprites[i].container
			var pos = positions[i]
			var resizeVars = Utils.ResizePositionProportionally(grid.blockSize[0], grid.blockSize[1], sprites[i].img.width, sprites[i].img.height, AppConstants.LANDSCAPE)
			container.x = pos[0] + (grid.blockSize[0] >> 1)
			container.y = pos[1] + (grid.blockSize[1] >> 1)
			container.scale.x = container.scale.y = resizeVars.scale - 0.3
		};
	}

	var imgLoaded = (error, el)=> {
		loaded++

		var src = el.src
		var sprt = getSpriteById(Utils.GetImgUrlId(src))
		sprt.img = el

		if(bigImgW < el.width) bigImgW = el.width
		if(loaded == urls.length) {
			allImgLoaded = true
			setupSprites()
			scope.resize()
		}
	}

	scope = {
		sprites: sprites,
		holder: holder,
		resize: ()=> {
			var windowW = AppStore.Window.w
			var windowH = AppStore.Window.h
			var size = [(windowW >> 1) + 1, windowH]
			var gridSize = [size[0]*0.6, size[1]*0.8]
			grid = gridPositions(gridSize[0], gridSize[1], 3, 1)

			bg.clear()
			bg.beginFill(0xffffff, 1);
			bg.drawRect(0, 0, size[0], size[1]);
			bg.endFill();

			if(!allImgLoaded) return
			resizeSprites()
			shoesHolder.x = (size[0] >> 1) - (gridSize[0] >> 1)
			shoesHolder.y = (size[1] >> 1) - (gridSize[1] >> 1)
		},
		load: ()=> {
			for (var i = 0; i < urls.length; i++) {
				var url = urls[i]
				img(url, imgLoaded)
			};
		}
	}
	return scope
}