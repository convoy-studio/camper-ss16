import AppStore from 'AppStore'
import AppConstants from 'AppConstants'
import Router from 'Router'
import dom from 'dom-hand'

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
		var el = dom.select(elementId)
		this.renderer.view.setAttribute('id', 'px-container')
		AppStore.Canvas = this.renderer.view
		dom.tree.add(el, this.renderer.view)
		this.stage = new PIXI.Container()
		// this.background = new PIXI.Graphics()
		// this.drawBackground(this.currentColor)
		// this.stage.addChild(this.background)

		// this.stats = new Stats();
		// // this.stats.setMode( 1 ); // 0: fps, 1: ms, 2: mb

		// // align top-left
		// this.stats.domElement.style.position = 'absolute';
		// this.stats.domElement.style.left = '0px';
		// this.stats.domElement.style.top = '0px';
		// this.stats.domElement.style['z-index'] = 999999

		// document.body.appendChild( this.stats.domElement );

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
		this.stats.update()
	    this.renderer.render(this.stage)
	}
	resize() {
		var scale = 1
		var windowW = AppStore.Window.w
		var windowH = AppStore.Window.h
		this.renderer.resize(windowW * scale, windowH * scale)
		// this.drawBackground(this.currentColor)
	}
}
