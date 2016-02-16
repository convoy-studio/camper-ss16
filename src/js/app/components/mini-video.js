import dom from 'dom-hand'

export default (props)=> {

	var scope;
	var video = document.createElement('video');
	var onReadyCallback;
	var size = { width: 0, height: 0 }
	var eListeners = []

	var onCanPlay = ()=>{
		if(props.autoplay) video.play()
		if(props.volume != undefined) video.volume = props.volume
		size.width = video.videoWidth
		size.height = video.videoHeight
		video.removeEventListener('canplay', onCanPlay);
        video.removeEventListener('canplaythrough', onCanPlay);
        onReadyCallback(scope)
	}

	var play = (time)=>{
		if(time != undefined) {
			scope.seek(time)
		}
    	scope.isPlaying = true
    	video.play()
    }

    var seek = (time)=> {
    	video.currentTime = time
    }

    var pause = (time)=>{
    	video.pause()
    	if(time != undefined) {
			scope.seek(time)
		}
    	scope.isPlaying = false
    }

    var ended = ()=>{
    	if(props.loop) play()
    }

	var addTo = (p)=> {
		scope.parent = p
		dom.tree.add(scope.parent, video)
	}

	var on = (event, cb)=> {
		eListeners.push({event:event, cb:cb})
		video.addEventListener(event, cb)
	}

	var off = (event, cb)=> {
		for (var i in eListeners) {
			var e = eListeners[i]
			if(e.event == event && e.cb == cb) {
				eListeners.splice(i, 1)
			}
		}
		video.removeEventListener(event, cb)
	}

	var clearAllEvents = ()=> {
	    for (var i in eListeners) {
	    	var e = eListeners[i]
	    	video.removeEventListener(e.event, e.cb);
	    }
	    eListeners.length = 0
	    eListeners = null
	}

	var clear = ()=> {
    	video.removeEventListener('canplay', onCanPlay);
	    video.removeEventListener('canplaythrough', onCanPlay);
	    video.removeEventListener('ended', ended);
	    scope.clearAllEvents()
	    size = null
	    video = null
    }

	video.addEventListener('canplay', onCanPlay);
    video.addEventListener('canplaythrough', onCanPlay);
    video.addEventListener('ended', ended);

	scope = {
		parent: undefined,
		el: video,
		size: size,
		play: play,
		seek: seek,
		pause: pause,
		addTo: addTo,
		on: on,
		off: off,
		clear: clear,
		clearAllEvents: clearAllEvents,
		isPlaying: props.autoplay || false,
		load: (src, callback)=> {
			onReadyCallback = callback
			video.src = src
		}
	}

	return scope

}