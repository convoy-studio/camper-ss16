import miniVideo from 'mini-video'

var videoCanvas = ( src, props )=> {

    var scope;
    var intervalId;
    var dx = 0, dy = 0, dWidth = 0, dHeight = 0;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var mVideo = miniVideo({
        autoplay: props.autoplay || false,
        volume: props.volume,
        loop: props.loop
    })


    var onCanPlay = ()=>{
        if(props.autoplay) mVideo.play()
        if(dWidth == 0) dWidth = mVideo.width()
        if(dHeight == 0) dHeight = mVideo.height()
        if(mVideo.isPlaying != true) drawOnce()
    }

    var drawOnce = ()=> {
        ctx.drawImage(mVideo.el, dx, dy, dWidth, dHeight)
    }

    var draw = ()=>{
        ctx.drawImage(mVideo.el, dx, dy, dWidth, dHeight)
    }

    var play = ()=>{
        mVideo.play()
        clearInterval(intervalId)
        intervalId = setInterval(draw, 1000 / 30)
    }

    var seek = (time)=> {
        mVideo.currentTime(time)
        drawOnce()
    }

    var timeout = (cb, ms)=> {
        setTimeout(()=> {
            cb(scope)
        }, ms)
    }

    var pause = ()=>{
        mVideo.pause()
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
        mVideo.clearAllEvents()
        ctx.clearRect(0,0,0,0)
    }

    if(props.onEnded != undefined) {
        mVideo.on('ended', ended)
    }

    mVideo.load(src, onCanPlay)

    scope = {
        canvas: canvas,
        video: mVideo,
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