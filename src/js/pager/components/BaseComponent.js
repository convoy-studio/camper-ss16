import slug from 'to-slug-case'

class BaseComponent {
	constructor() {
		this.domIsReady = false
		this.componentDidMount = this.componentDidMount.bind(this)
	}
	componentWillMount() {
	}
	componentDidMount() {
		this.domIsReady = true
		this.resize()
	}
	render(childId, parentId, template, object) {
		this.componentWillMount()
		this.childId = childId
		this.parentId = parentId
		this.parent = (parentId instanceof jQuery) ? parentId : $(this.parentId)
		this.element = (template == undefined) ? $('<div></div>') : $(template(object))
		if(this.element.attr('id') == undefined) this.element.attr('id', slug(childId))
		this.element.ready(this.componentDidMount)
		this.parent.append(this.element)
	}
	remove() {
		this.componentWillUnmount()
		this.element.remove()
	}
	resize() {
	}
	componentWillUnmount() {
	}
}

export default BaseComponent

