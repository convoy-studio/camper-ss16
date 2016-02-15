import AppConstants from 'AppConstants'
import dom from 'dom-hand'

class Utils {
	static NormalizeMouseCoords(e, objWrapper) {
		var posx = 0;
		var posy = 0;
		if (!e) var e = window.event;
		if (e.pageX || e.pageY) 	{
			posx = e.pageX;
			posy = e.pageY;
		}
		else if (e.clientX || e.clientY) 	{
			posx = e.clientX + document.body.scrollLeft
				+ document.documentElement.scrollLeft;
			posy = e.clientY + document.body.scrollTop
				+ document.documentElement.scrollTop;
		}
		objWrapper.x = posx
		objWrapper.y = posy
		return objWrapper
	}
	static ResizePositionProportionally(windowW, windowH, contentW, contentH, orientation) {
		var aspectRatio = contentW / contentH
		if(orientation !== undefined) {
			if(orientation == AppConstants.LANDSCAPE) {
				var scale = (windowW / contentW) * 1
			}else{
				var scale = (windowH / contentH) * 1
			}
		}else{
			var scale = ((windowW / windowH) < aspectRatio) ? (windowH / contentH) * 1 : (windowW / contentW) * 1
		}
		var newW = contentW * scale
		var newH = contentH * scale
		var css = {
			width: newW,
			height: newH,
			left: (windowW >> 1) - (newW >> 1),
			top: (windowH >> 1) - (newH >> 1),
			scale: scale
		}
		
		return css
	}
	static CapitalizeFirstLetter(string) {
	    return string.charAt(0).toUpperCase() + string.slice(1);
	}
	static SupportWebGL() {
		try {
			var canvas = document.createElement( 'canvas' );
			return !! ( window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) );
		} catch ( e ) {
			return false;
		}
	}
	static DestroyVideo(video) {
        video.pause();
        video.src = '';
        var children = video.childNodes
        for (var i = 0; i < children.length; i++) {
        	var child = children[i]
        	child.setAttribute('src', '');
        	// Working with a polyfill or use jquery
        	dom.tree.remove(child)
        }
    }
    static DestroyVideoTexture(texture) {
    	var video = texture.baseTexture.source
        Utils.DestroyVideo(video)
    }
    static Rand(min, max, decimals) {
        var randomNum = Math.random() * (max - min) + min
        if(decimals == undefined) {
        	return randomNum
        }else{
	        var d = Math.pow(10, decimals)
	        return ~~((d * randomNum) + 0.5) / d
        }
	}
	static GetImgUrlId(url) {
		var split = url.split('/')
		return split[split.length-1].split('.')[0]
	}
	static Style(div, style) {
    	div.style.webkitTransform = style
		div.style.mozTransform    = style
		div.style.msTransform     = style
		div.style.oTransform      = style
		div.style.transform       = style
    }
    static Translate(div, x, y, z) {
    	if ('webkitTransform' in document.body.style || 'mozTransform' in document.body.style || 'oTransform' in document.body.style || 'transform' in document.body.style) {
    		Utils.Style(div, 'translate3d('+x+'px,'+y+'px,'+z+'px)')
		}else{
			div.style.top = y + 'px'
			div.style.left = x + 'px'
		}
    }
    static SpringTo(item, toPosition, index) {
    	var dx = toPosition.x - item.position.x
    	var dy = toPosition.y - item.position.y
		var angle = Math.atan2(dy, dx)
		var targetX = toPosition.x - Math.cos(angle) * (item.config.length * index)
		var targetY = toPosition.y - Math.sin(angle) * (item.config.length * index)
		item.velocity.x += (targetX - item.position.x) * item.config.spring
		item.velocity.y += (targetY - item.position.y) * item.config.spring
		item.velocity.x *= item.config.friction
		item.velocity.y *= item.config.friction
    }
}

export default Utils
