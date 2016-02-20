import dom from 'dom-hand'
import AppStore from 'AppStore'
import AppActions from 'AppActions'

export default (container, data)=> {
	
	var scope;
	var el = dom.select('footer', container)
	var buttons = dom.select.all('li', el)

	var onBtnClick = (e)=> {
		e.preventDefault()
		var target = e.currentTarget
		var id = target.id
		var url = undefined;
		switch(id) {
			case 'home':
				AppActions.openFeed()
				break
			case 'grid':
				AppActions.openGrid()
				break
			case 'com':
				url = 'http://www.camper.com/'
				break
			case 'lab':
				url = data.labUrl
				break
			case 'shop':
				url = 'http://www.camper.com/'
				break
		}
		if(url != undefined) window.open(url,'_blank')
	}

	var btn, i
	for (i = 0; i < buttons.length; i++) {
		btn = buttons[i]
		dom.event.on(btn, 'click', onBtnClick)
	}

	scope = {
		resize: ()=> {
			var windowW = AppStore.Window.w
			var windowH = AppStore.Window.h

			var btnW = windowW / buttons.length

			for (var i = 0; i < buttons.length; i++) {
				var btn = buttons[i]
				btn.style.width = btnW + 'px'
				btn.style.left = btnW * i + "px"
			}
		}
	}

	return scope
}