import AppStore from 'AppStore'
import AppConstants from 'AppConstants'
import colorUtils from 'color-utils'

export default (pxContainer, colors)=> {

	var scope;

	var holder = new PIXI.Container()
	pxContainer.addChild(holder)

	var bgColors = []
	bgColors.length = 6

	var tl = new TimelineLite()

	for (var i = 0; i < bgColors.length; i++) {
		var bgColor = new PIXI.Graphics()
		bgColors[i] = bgColor
		holder.addChild(bgColor)
	};

	var open = ()=> {
		tl.timeScale(1.5)
		tl.play(0)
		scope.isOpen = true
	}
	var close = ()=> {
		tl.timeScale(2)
		tl.reverse()
		scope.isOpen = false
	}

	scope = {
		tl: tl,
		isOpen: false,
		holder: holder,
		open: open,
		close: close,
		resize: (width, height, direction)=>{

			tl.clear()

			var hs = colors.from.h - colors.to.h
			var ss = colors.from.s - colors.to.s
			var vs = colors.from.v - colors.to.v
			var len = bgColors.length
			var stepH = hs / bgColors.length
			var stepS = ss / bgColors.length
			var stepV = vs / bgColors.length
			var hd = (hs < 0) ? -1 : 1
			var sd = (ss < 0) ? -1 : 1
			var vd = (vs < 0) ? -1 : 1

			var delay = 0.12
			for (var i = 0; i < len; i++) {
				var bgColor = bgColors[i]
				var h = Math.round(colors.from.h + (stepH*i*hd))
				var s = Math.round(colors.from.s + (stepS*i*sd))
				var v = Math.round(colors.from.v + (stepV*i*vd))
				var c = '0x' + colorUtils.hsvToHex(h, s, v)
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