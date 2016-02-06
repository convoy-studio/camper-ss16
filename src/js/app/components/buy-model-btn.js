import dom from 'dom-hand'
import Utils from 'Utils'

export default (parent)=> {

	var scope
	var el = dom.select('.buy-model-btn', parent)
	var frontEl = dom.select('.front', el)
	var backgroundEl = dom.select('.background', el)
	var position = { x:0, y:0 }
	var btnSize = [ 0, 0 ]

	scope = {
		active: false,
		currentLink: undefined,
		resize: ()=> {
			setTimeout(()=> {
				var frontSize = dom.size(frontEl)
				
				btnSize = [ frontSize[0] + 40, frontSize[1] + 28 ]
				backgroundEl.style.width = btnSize[0] + 'px'
				backgroundEl.style.height = btnSize[1] + 'px'

				frontEl.style.left = (btnSize[0] >> 1) - (frontSize[0] >> 1) + 'px'
				frontEl.style.top = (btnSize[1] >> 1) - (frontSize[1] >> 1) + 'px'
			})
		},
		move: (x, y)=> {
			x -= (btnSize[0] >> 1) + 10
			y -= (btnSize[1] >> 1) + 10
			position.x += (x - position.x) * .1
			position.y += (y - position.y) * .1
			Utils.Translate(el, position.x, position.y, 0)
		}
	}
	return scope
}