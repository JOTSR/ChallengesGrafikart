export default class ViewSection extends HTMLElement {
	static get observedAttributes() {
		return ['title']
	}

	constructor() {
		super()
		this.properties = {
			title: '',
		}
		this.shadow = this.attachShadow({ mode: 'open' })
		this.shadow.innerHTML = `
        <style>
            h3 {
                background-color: ${getComputedStyle(this).borderColor};
                margin: -0.25rem -0.25rem 1rem -0.25rem;
				padding: 1rem 0.63rem;
				/*
				position: sticky;
				top: 0;
				*/
			}
			
			:host {
				overflow-y: auto;
				overflow-x: hidden;
			}
        </style>
        <h3>${this.properties.title}</h3>
        <slot/>`
		this.updateAttributes = this.updateAttributes.bind(this)
	}

	connectedCallback() {}

	disconnectedCallback() {}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue !== newValue) {
			switch (name) {
				case 'title':
					this.properties.title = newValue
					break
			}
			this.updateAttributes(name)
		}
	}

	updateAttributes(attribute) {
		switch (attribute) {
			case 'title':
				this.shadow.querySelector(
					'h3'
				).innerText = this.properties.title
				break
		}
	}
}
