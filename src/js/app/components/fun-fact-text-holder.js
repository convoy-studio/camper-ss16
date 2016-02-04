import AppStore from 'AppStore'
import Utils from 'Utils'
import colorUtils from 'color-utils'
// import shoesGrid from 'shoes-grid'

export default (pxContainer)=> {
	var scope;

	var holder = new PIXI.Container()
	pxContainer.addChild(holder)

	var bgColors = []
	bgColors.length = 5

	for (var i = 0; i < bgColors.length; i++) {
		var bgColor = new PIXI.Graphics()
		bgColors[i] = bgColor
		holder.addChild(bgColor)
	};

	// var sGrid = shoesGrid(holder, onShoeMouseOver, onShoeMouseOut)
	// sGrid.load()

	var tl = new TimelineLite()

	var open = ()=> {
		tl.timeScale(1.1)
		tl.play(0)
		scope.isOpen = true
	}
	var close = ()=> {
		tl.timeScale(1.6)
		tl.reverse()
		scope.isOpen = false
	}

	scope = {
		isOpen: false,
		open: open,
		close: close,
		resize: ()=>{
			var windowW = AppStore.Window.w
			var windowH = AppStore.Window.h

			var size = [(windowW >> 1) + 1, windowH]

			// sGrid.resize()

			tl.clear()

			var initialS = 87
			var v = 92
			var lightStep = Math.round(initialS / bgColors.length)
			var delay = 0.12
			var len = bgColors.length
			for (var i = 0; i < len; i++) {
				var bgColor = bgColors[i]
				var s = initialS - (lightStep*i) - lightStep
				if(s <= 0) {
					s = 0
					v = 100
				}
				var c = '0x' + colorUtils.hsvToHex(147, s, v)
				bgColor.clear()
				bgColor.beginFill(c, 1);
				bgColor.drawRect(0, 0, size[0], size[1]);
				bgColor.endFill();

				tl.fromTo(bgColor, 1.4, { y:-windowH }, { y:windowH, ease:Expo.easeInOut }, delay*i)
			};

			// tl.from(sGrid.holder, 1, { y:-windowH, ease:Expo.easeInOut }, delay*len)

			// for (var i = 0; i < sGrid.sprites.length; i++) {
			// 	var sprt = sGrid.sprites[i]
			// 	tl.from(sprt.sprite.scale, 0.6, { x:0, y:0, ease:Back.easeOut }, delay*len + 0.4 + (i*0.1))
			// };

			tl.pause(0)
		}
	}
	return scope
}