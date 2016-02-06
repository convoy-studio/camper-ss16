import AppStore from 'AppStore'
import AppConstants from 'AppConstants'
import colorUtils from 'color-utils'

export default (pxContainer, color)=> {

	var scope;

	var holder = new PIXI.Container()
	pxContainer.addChild(holder)

	var bgColors = []
	bgColors.length = 5

	var tl = new TimelineLite()

	for (var i = 0; i < bgColors.length; i++) {
		var bgColor = new PIXI.Graphics()
		bgColors[i] = bgColor
		holder.addChild(bgColor)
	};

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
		resize: (width, height, direction)=>{

			tl.clear()

			var initialS = color.s
			var v = color.v
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
				var c = '0x' + colorUtils.hsvToHex(color.h, s, v)
				bgColor.clear()
				bgColor.beginFill(c, 1);
				bgColor.drawRect(0, 0, width, height);
				bgColor.endFill();

				switch(direction) {
					case AppConstants.TOP:
						tl.fromTo(bgColor, 1.4, { y:height }, { y:-height, ease:Expo.easeInOut }, delay*i)
						break
					case AppConstants.BOTTOM:
						tl.fromTo(bgColor, 1.4, { y:-height }, { y:height, ease:Expo.easeInOut }, delay*i)
						break
					case AppConstants.LEFT:
						tl.fromTo(bgColor, 1.4, { x:width }, { x:-width, ease:Expo.easeInOut }, delay*i)
						break
					case AppConstants.RIGHT:
						tl.fromTo(bgColor, 1.4, { x:-width }, { x:width, ease:Expo.easeInOut }, delay*i)
						break
				}
				
			};

			tl.pause(0)
		},
		clear: ()=> {
			tl.clear()
			pxContainer.removeChild(holder)
			for (var i = 0; i < bgColors.length; i++) {
				var bgColor = bgColors[i]
				bgColor.clear()
				holder.removeChild(bgColor)
				bgColor = null
			};
			bgColors = null
			tl = null
			holder = null
		}
	}

	return scope

}