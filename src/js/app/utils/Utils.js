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
	static ResizePositionProportionally(windowW, windowH, contentW, contentH) {
		var aspectRatio = contentW / contentH
		var scale = ((windowW / windowH) < aspectRatio) ? (windowH / contentH) * 1 : (windowW / contentW) * 1
		var newW = contentW * scale
		var newH = contentH * scale
		var css = {
			width: newW,
			height: newH,
			left: (windowW >> 1) - (newW >> 1),
			top: (windowH >> 1) - (newH >> 1)
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
        	$(child).remove()
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
    static RandomColor() {
	    var letters = '0123456789ABCDEF'.split('');
	    var color = '#';
	    for (var i = 0; i < 6; i++ ) {
	        color += letters[Math.floor(Math.random() * 16)];
	    }
	    return color;
	}
}

export default Utils
