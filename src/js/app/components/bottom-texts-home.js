import AppStore from 'AppStore'
import AppConstants from 'AppConstants'
import dom from 'dom-hand'
import textBtn from 'text-btn'

var bottomTexts = (parent)=> {

	var scope;
	var el = dom.select('.bottom-texts-container', parent)
	var socialWrapper = dom.select('#social-wrapper', el)
	var titlesWrapper = dom.select('.titles-wrapper', el)
	var allTitles = dom.select.all('li', titlesWrapper)
	var textsEls = dom.select.all('.texts-wrapper .txt', el)
	var texts = []
	var ids = ['generic', 'deia', 'es-trenc', 'arelluf']
	var oldText, currentOpenId;
	var masksParent = dom.select('.inner-mask-background', el)
	var background = dom.select('.inner-background', el)
	var masksChildren = dom.select.all('.inner-mask-background div', masksParent).reverse()
	var masksTween = undefined
	var firstTime = true
	var changeTextAnimTimeout;
	var isAnimate = false

	var simpleTextBtnsEl = dom.select.all('.text-btn', titlesWrapper)
	var simpleBtns = []
	var i, s, e, id;
	for (i = 0; i < simpleTextBtnsEl.length; i++) {
		e = simpleTextBtnsEl[i]
		id = e.id
		s = textBtn(e)
		s.id = id
		simpleBtns[i] = s
	}

	var setupMaskTween = (blockSize)=> {
		if(masksTween != undefined) {
			masksTween.clear()
			masksTween = null
		}
 		masksTween = new TimelineMax()
		masksTween.staggerFromTo(masksChildren, 1, { x:blockSize[0]+2, scaleY:4, transformOrigin:'0% 0%' }, { x:-blockSize[0]-2, scaleY:1, transformOrigin:'0% 0%', ease:Expo.easeInOut }, 0.08, 0.1)
		masksTween.to(background, 0.4, { scale:1.2, transformOrigin:'50% 50%', ease:Elastic.easeOut }, 0)
		masksTween.to(background, 0.5, { scale:1, transformOrigin:'50% 50%', ease:Elastic.easeOut }, 0.1)
		masksTween.pause(0)
	}

	var onTitleClicked = (e)=> {
		e.preventDefault()
		var id = e.currentTarget.id
		scope.openTxtById(id)
	}

	var i, t;
	for (var i = 0; i < allTitles.length; i++) {
		t = allTitles[i]
		dom.event.on(t, 'click', onTitleClicked)
	}

	var id, e, i, split;
	for (i = 0; i < ids.length; i++) {
		id = ids[i]
		e = textsEls[i]
		var txtBtn = undefined
		for (var j = 0; j < simpleBtns.length; j++) {
			if(simpleBtns[j].id == id) {
				txtBtn = simpleBtns[j]
			}
		}
		texts[i] = {
			id: id,
			el: e,
			btn: txtBtn
		}
	}

	var resize = ()=> {
		var windowW = AppStore.Window.w
		var windowH = AppStore.Window.h

		var blockSize = [ windowW / AppConstants.GRID_COLUMNS, windowH / AppConstants.GRID_ROWS ]

		var padding = 40
		var borderAround
		blockSize[0] *= 2 
		blockSize[1] *= 2 
		blockSize[0] -= padding
		blockSize[1] -= padding
		var innerBlockSize = [blockSize[0] - 10, blockSize[1] - 10]
		var textW = innerBlockSize[0] * 0.8

		el.style.width = innerBlockSize[0] + 'px'
		el.style.height = innerBlockSize[1] + 'px'
		el.style.left = windowW - blockSize[0] - (padding >> 1) + 'px'
		el.style.top = windowH - blockSize[1] - (padding >> 1) + 'px'

		setTimeout(()=> {
			var socialSize = dom.size(socialWrapper)
			var titlesSize = dom.size(titlesWrapper)

			var i, text, s, split, tl;
			for (i = 0; i < texts.length; i++) {
				text = texts[i]
				s = dom.size(text.el)
				text.el.style.top = (innerBlockSize[1] >> 1) - (s[1] >> 1) + 'px'
				split = new SplitText(text.el, {type:"lines"}).lines
				if(text.tl != undefined) text.tl.clear()
				tl = new TimelineMax()
				tl.staggerFrom(split, 1, { y:5, scaleY:2, opacity:0, force3D:true, transformOrigin:'50% 0%', ease:Expo.easeOut }, 0.05, 0)
				tl.pause(0)
				text.tl = tl
			}

			socialWrapper.style.left = (innerBlockSize[0] >> 1) - (socialSize[0] >> 1) + 'px'
			socialWrapper.style.top = innerBlockSize[1] - socialSize[1] - (padding >> 1) + 'px'

			setupMaskTween(innerBlockSize)

			if(currentOpenId != undefined) {
				scope.openTxtById(currentOpenId, true)
			}

		}, 0)

	}

	scope = {
		el: el,
		resize: resize,
		openTxtById: (id, force)=> {
			currentOpenId = id
			var f = force || false
			if(!f) {
				if(isAnimate) return
				isAnimate = true
				changeTextAnimTimeout = setTimeout(()=>{
					isAnimate = false
				}, 1100)
			}
			var i, text;
			for (i = 0; i < texts.length; i++) {
				text = texts[i]
				if(id == text.id) {
					if(oldText != undefined){
						// if(id == oldText.id) return
						oldText.tl.timeScale(2.6).reverse()
						if(oldText.btn != undefined) oldText.btn.disactivate()
					}

					if(f) {
						text.tl.pause(text.tl.totalDuration())
					}else{
						setTimeout(()=>text.tl.timeScale(1.2).play(), 900)
						setTimeout(()=>masksTween.play(0), 200)
						if(text.btn != undefined) text.btn.activate()
					}

					oldText = text
					return
				}
			}
		},
		clear: ()=> {
			var i, t;
			for (i = 0; i < allTitles.length; i++) {
				t = allTitles[i]
				dom.event.off(t, 'click', onTitleClicked)
			}
			for (i = 0; i < texts.length; i++) {
				t = texts[i]
				t.tl.clear()
			}
			masksTween.clear()
			ids = null
			texts = null
			allTitles = null
			textsEls = null
			masksTween = null
		}
	}

	return scope
}

export default bottomTexts