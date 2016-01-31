
var videoCanvas = ( src, props )=> {

	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	var video = document.createElement('video');
	var intervalId;
	var dx = 0, dy = 0, dWidth = 0, dHeight = 0;
	var isPlaying = props.autoplay || false
	var scope;

	var onCanPlay = ()=>{
		if(props.autoplay) video.play()
		if(props.volume != undefined) video.volume = props.volume
		if(dWidth == 0) dWidth = video.videoWidth
		if(dHeight == 0) dHeight = video.videoHeight
		if(isPlaying != true) drawOnce()
		video.removeEventListener('canplay', onCanPlay);
        video.removeEventListener('canplaythrough', onCanPlay);
	}

	var drawOnce = ()=> {
		ctx.drawImage(video, dx, dy, dWidth, dHeight)
	}

    var draw = ()=>{
    	ctx.drawImage(video, dx, dy, dWidth, dHeight)
    }

    var play = ()=>{
    	isPlaying = true
    	video.play()
    	clearInterval(intervalId)
    	intervalId = setInterval(draw, 1000 / 30)
    }

    var seek = (time)=> {
    	video.currentTime = time
    	drawOnce()
    }

    var timeout = (cb, ms)=> {
    	setTimeout(()=> {
    		cb(scope)
    	}, ms)
    }

    var pause = ()=>{
    	isPlaying = false
    	video.pause()
    	clearInterval(intervalId)
    }

    var ended = ()=>{
    	if(props.loop) play()
    	if(props.onEnded != undefined) props.onEnded(scope)
    	clearInterval(intervalId)
    }

    var resize = (x, y, w, h)=>{
    	dx = x
    	dy = y
    	dWidth = w
    	dHeight = h
    }

    var clear = ()=> {
    	clearInterval(intervalId)
    	video.removeEventListener('canplay', onCanPlay);
	    video.removeEventListener('canplaythrough', onCanPlay);
	    video.removeEventListener('play', play)
	    video.removeEventListener('pause', pause)
	    video.removeEventListener('ended', ended)
    }

	video.addEventListener('canplay', onCanPlay);
    video.addEventListener('canplaythrough', onCanPlay);
    video.addEventListener('play', play)
    video.addEventListener('pause', pause)
    video.addEventListener('ended', ended)

	video.src = src

	scope = {
		canvas: canvas,
		video: video,
		ctx: ctx,
		drawOnce: drawOnce,
		play: play,
		pause: pause,
		seek: seek,
		timeout: timeout,
		resize: resize,
		clear: clear
	}

	return scope
}


export default videoCanvas