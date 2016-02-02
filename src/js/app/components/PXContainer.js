import AppStore from 'AppStore'
import AppConstants from 'AppConstants'
import Router from 'Router'

export default class PXContainer {
	constructor() {
	}
	init(elementId) {
		this.clearBack = false

		this.add = this.add.bind(this)
		this.remove = this.remove.bind(this)

		AppStore.on(AppConstants.PX_CONTAINER_ADD_CHILD, this.add)
		AppStore.on(AppConstants.PX_CONTAINER_REMOVE_CHILD, this.remove)

		var renderOptions = {
		    resolution: 1,
		    transparent: true,
		    antialias: true
		};
		this.renderer = new PIXI.autoDetectRenderer(1, 1, renderOptions)
		// this.renderer = new PIXI.CanvasRenderer(1, 1, renderOptions)
		this.currentColor = 0xffffff
		var el = $(elementId)
		$(this.renderer.view).attr('id', 'px-container')
		el.append(this.renderer.view)
		this.stage = new PIXI.Container()
		this.background = new PIXI.Graphics()
		this.drawBackground(this.currentColor)
		this.stage.addChild(this.background)
	}
	drawBackground(color) {
		var windowW = AppStore.Window.w
		var windowH = AppStore.Window.h

		this.background.clear()
		this.background.lineStyle(0);
		this.background.beginFill(color, 1);
		this.background.drawRect(0, 0, windowW, windowH);
		this.background.endFill();
	}
	add(child) {
		this.stage.addChild(child)
	}
	remove(child) {
		this.stage.removeChild(child)
	}
	update() {
	    this.renderer.render(this.stage)
	}
	resize() {
		var scale = 1
		var windowW = AppStore.Window.w
		var windowH = AppStore.Window.h
		this.renderer.resize(windowW * scale, windowH * scale)
		this.drawBackground(this.currentColor)
	}
}
