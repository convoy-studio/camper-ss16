import AppConstants from 'AppConstants'

var PxHelper = {

    getPXVideo: function(url, width, height, vars) {
        var texture = PIXI.Texture.fromVideo(url)
        texture.baseTexture.source.setAttribute("loop", true)
        var videoSprite = new PIXI.Sprite(texture)
        videoSprite.width = width
        videoSprite.height = height
        return videoSprite
    },

    removeChildrenFromContainer: function(container) {
        var children = container.children
        for (var i = 0; i < children.length; i++) {
            var child = children[i]
            container.removeChild(child)
        };
    },

    getFrameImagesArray: function(frames, baseurl, ext) {
        var array = []
        for (var i = 0; i <= frames; i++) {
            var url = baseurl + i + '.' + ext
            array[i] = url
        };
        return array
    }

}

export default PxHelper