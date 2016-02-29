import TextBtnTemplate from 'TextBtn_hbs'
import dom from 'dom-hand'
import AppConstants from 'AppConstants'

export default (container)=> {

	var scope;

	var title = container.innerHTML.toUpperCase()
	var btnScope = { title: title }
	var template = TextBtnTemplate(btnScope)
	container.innerHTML = template
	var textTitle = dom.select('.text-title', container)
	var size = dom.size(textTitle)
	var currentTl, tlLeft, tlRight;
	var rectContainers = dom.select.all('.rects-container', container)
	var bgLinesLeft = dom.select.all('.bg-line', rectContainers[0])
	var bgBoxLeft = dom.select('.bg-box', rectContainers[0])
	var bgLinesRight = dom.select.all('.bg-line', rectContainers[1])
	var bgBoxRight = dom.select('.bg-box', rectContainers[1])
	var isActivated = false
	
	var tweenIn = (direction)=> {
		if(direction == AppConstants.LEFT) {
			currentTl = tlLeft
			tlLeft.timeScale(2).tweenFromTo(0, 'in')
		}else{	
			currentTl = tlRight
			tlRight.timeScale(2).tweenFromTo(0, 'in')
		}
	}
	var tweenOut = ()=> {
		currentTl.timeScale(2.6).tweenTo('out')
	}

	var mouseEnter = (e)=> {
		e.preventDefault()
		if(isActivated) return
		var rect = e.currentTarget.getBoundingClientRect();
		var xMousePos = e.clientX
		var xPos = xMousePos - rect.left
		var w = rect.right - rect.left
		if(xPos > w / 2) {
			tweenIn(AppConstants.RIGHT)
		}else{
			tweenIn(AppConstants.LEFT)
		}
	}
	var mouseLeave = (e)=> {
		e.preventDefault()
		if(isActivated) return
		tweenOut()
	}
	var activate = ()=> {
		isActivated = true
		currentTl.timeScale(3).tweenTo('in')
	}
	var disactivate = ()=> {
		isActivated = false
		tlLeft.timeScale(3).tweenTo('out')
		tlRight.timeScale(3).tweenTo('out')
	}

	dom.event.on(container, 'mouseenter', mouseEnter)
	dom.event.on(container, 'mouseleave', mouseLeave)

	var offsetX = 26
	tlLeft = new TimelineMax()
	tlLeft.fromTo(bgLinesLeft[0], 1, { scaleX:0, transformOrigin:'0% 50%' }, { scaleX:1, transformOrigin:'0% 50%', ease:Expo.easeInOut }, 0)
	tlLeft.fromTo(bgBoxLeft, 1, { scaleX:0, transformOrigin:'0% 50%' }, { scaleX:1, transformOrigin:'0% 50%', ease:Expo.easeInOut }, 0.2)
	tlLeft.fromTo(bgLinesLeft[1], 1, { scaleX:0, transformOrigin:'0% 50%' }, { scaleX:1, transformOrigin:'0% 50%', ease:Expo.easeInOut }, 0.4)
	tlLeft.to(bgLinesLeft[0], 1, { x:'105%', transformOrigin:'0% 50%', ease:Expo.easeInOut }, 0.5)
	tlLeft.to(bgBoxLeft, 1, { x:'105%', transformOrigin:'0% 50%', ease:Expo.easeInOut }, 0.6)
	tlLeft.addLabel('in')
	tlLeft.to(bgLinesLeft[1], 1, { x:'105%', transformOrigin:'0% 50%', ease:Expo.easeInOut }, 'in')
	tlLeft.addLabel('out')
	tlLeft.pause(0)

	tlRight = new TimelineMax()
	tlRight.fromTo(bgLinesRight[0], 1, { scaleX:0, transformOrigin:'100% 50%' }, { scaleX:1, transformOrigin:'100% 50%', ease:Expo.easeInOut }, 0)
	tlRight.fromTo(bgBoxRight, 1, { scaleX:0, transformOrigin:'100% 50%' }, { scaleX:1, transformOrigin:'100% 50%', ease:Expo.easeInOut }, 0.2)
	tlRight.fromTo(bgLinesRight[1], 1, { scaleX:0, transformOrigin:'100% 50%' }, { scaleX:1, transformOrigin:'100% 50%', ease:Expo.easeInOut }, 0.4)
	tlRight.to(bgLinesRight[0], 1, { x:'-105%', transformOrigin:'100% 50%', ease:Expo.easeInOut }, 0.5)
	tlRight.to(bgBoxRight, 1, { x:'-105%', transformOrigin:'100% 50%', ease:Expo.easeInOut }, 0.6)
	tlRight.addLabel('in')
	tlRight.to(bgLinesRight[1], 1, { x:'-105%', transformOrigin:'100% 50%', ease:Expo.easeInOut }, 'in')
	tlRight.addLabel('out')
	tlRight.pause(0)

	scope = {
		size: size,
		el: container,
		activate: activate,
		disactivate: disactivate,
		clear: ()=> {
			tlLeft.clear()
			tlRight.clear()
			dom.event.off(container, 'mouseenter', mouseEnter)
			dom.event.off(container, 'mouseleave', mouseLeave)
			tlLeft = null
			tlRight = null
			currentTl = null
			rectContainers = null
			bgLinesLeft = null
			bgLinesRight = null
		}
	}

	return scope;

}