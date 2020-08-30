export default class Graph2d extends HTMLElement {
	static get observedAttributes() {
		return ['title', 'axe-x', 'axe-y', 'label-x', 'label-y', 'value']
	}

	constructor() {
		super()
		this.properties = {
			title: '',
			axeY: [],
			axeY: [],
			labelX: [],
			labelY: [],
			value: null,
		}
		this.shadow = this.attachShadow({ mode: 'open' })
		this.shadow.innerHTML = `
		<style>	
			:host {
				display: grid;
				grid-template-columns: ${
					/*this.normalize(this.properties.axeX).join('fr ')*/ 1
				}fr;
				grid-template-rows: ${
					/*this.normalize(this.properties.axeY).join('fr ')*/ 1
				}fr auto;
				gap: 0.13rem;
				padding: 0.3rem;
			}

			.blocks {
				background-color: rgb(255, 255, 255, 0.8);
				overflow: visible;
				display: grid;
				grid-template-columns: 1fr 1fr 1fr;
				padding: 0.13rem;
			}

			h3 {
				margin: 0.13rem;
				text-align: center;
			}

			#trace {
				display: grid;
				gap: 0.13rem;
			}

			#trace :first-child {
				border-top-left-radius: ${getComputedStyle(this).borderRadius};
				border-top-right-radius: ${getComputedStyle(this).borderRadius};
			}

			#trace :last-child {
				border-bottom-left-radius: ${getComputedStyle(this).borderRadius};
				border-bottom-right-radius: ${getComputedStyle(this).borderRadius};
			}

		</style>
		<div id="trace">
		<h4 style="color: rgb(255, 0, 100); margin: auto; padding: 0.3rem 0.6rem; background-color: white; border-radius: 0.3rem; text-align: center;">Aucune donnée</h4>
		<!--	
		<div class="blocks" style="background-color: rgba(255,255,255,0.3);">10 30%</div>
			<div class="blocks" style="background: linear-gradient(0deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.3) 100%);">15 25%</div>
			<div class="blocks">20 40%</div>
			<div class="blocks">25 35%</div>
			<div class="blocks">15 20%</div>
			-->
		</div>
		<h3>${this.properties.title}</h3>`
		this.updateAttributes = this.updateAttributes.bind(this)
	}

	connectedCallback() {}

	disconnectedCallback() {}

	attributeChangedCallback(name, oldValue, newValue) {
		try {
			if (oldValue !== newValue) {
				switch (name) {
					case 'title':
						this.properties.title = newValue
						break
					case 'axe-y':
						this.properties.axeY = JSON.parse(newValue)
						break
					case 'axe-x':
						this.properties.axeX = JSON.parse(newValue)
						break
					case 'label-y':
						this.properties.labelY = JSON.parse(newValue)
						break
					case 'label-x':
						this.properties.labelX = JSON.parse(newValue)
						break
					case 'value':
						this.properties.value = parseFloat(newValue)
						break
				}
				this.updateAttributes(name)
			}
		} catch (e) {
			//do nothing
		}
	}

	updateAttributes(attribute) {
		switch (attribute) {
			case 'title':
				this.shadow.querySelector(
					'h3'
				).innerText = this.properties.title
				break
			case 'axe-y':
			case 'value':
				if (this.properties.value ?? false) {
					const trace = this.shadow.querySelector('#trace')
					const tempHTML = []
					this.properties.axeY.forEach((level, index) => {
						if (
							this.properties.value > level &&
							this.properties.value <
								this.properties.axeY[index + 1]
						) {
							const cursor = Math.round(
								100 * (this.properties.value / level - 1)
							)
							tempHTML.push(
								`<div class="blocks" style="background: linear-gradient(0deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.8) ${cursor}%, rgba(255,255,255,0.3) ${cursor}%, rgba(255,255,255,0.3) 100%);"><span>${level} €</span><span style="text-align: center; font-weight: bold;">${Math.round(
									this.properties.value
								)} €</span><span style="text-align: right;">${
									this.properties.labelY[index]
								}</span></div>`
							)
						} else if (this.properties.value > level)
							tempHTML.push(
								`<div class="blocks"><span>${level} €</span><span> </span><span style="text-align: right;">${this.properties.labelY[index]}</span></div>`
							)
						else if (this.properties.value < level)
							tempHTML.push(
								`<div class="blocks" style="background-color: rgba(255,255,255,0.3);"><span>${level} €</span><span> </span><span style="text-align: right;">${this.properties.labelY[index]}</span></div>`
							)
					})
					tempHTML.push(
						`<div class="blocks" style="background-color: rgba(0, 0, 0, 0.2); color: white; font-weight: bold;"><span style="margin: auto;">Montant des revenus</span><span> </span><span style="text-align: right; margin: auto;">% d'imposition</span></div>`
					)
					trace.innerHTML = tempHTML.reverse().join(' ')
					/*
				trace.style.gridTemplateRows = `${this.normalize(
					this.properties.axeY
				).join('fr ')}fr`
				*/
				}

				break
			case 'axe-x':
				/*
				this.shadow.querySelector(
					'#trace'
				).style.gridTemplateColumns = `${this.normalize(
					this.properties.axeX
				).join('fr ')}fr`
				*/
				break
			case 'label-y':
				break
			case 'label-x':
				break
			case 'value':
				break
		}
	}

	max(array) {
		let max = array[0]
		array.forEach((element) => {
			if (element > max) max = element
		})
		return max
	}

	normalize(array) {
		const max = this.max(array)
		return array.map((e) => e / max)
	}
}
