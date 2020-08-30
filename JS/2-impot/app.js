function $(selector) {
	const elements = document.querySelectorAll(selector)
	return elements.length === 1 ? elements[0] : Array.from(elements)
}

const TauxImpot = {
	2019: [
		{ seuil: 0, taux: 0 },
		{ seuil: 10064, taux: 0.14 },
		{ seuil: 27794, taux: 0.3 },
		{ seuil: 74517, taux: 0.41 },
		{ seuil: 157806, taux: 0.45 },
	],
	2020: [
		{ seuil: 0, taux: 0 },
		{ seuil: 10064, taux: 0.11 },
		{ seuil: 25659, taux: 0.3 },
		{ seuil: 73369, taux: 0.41 },
		{ seuil: 157806, taux: 0.45 },
	],
}

const enfants = $('#enfants')
const cmi = $('#cmi')
const conjoint = $('#conjoint')

const salaire = $('#salaire')
const impot = $('#impot')

const annee = $('#annee')
const graph = $('#graph')

const enfantsLabel = $('label[for="enfants"]')
const cmiLabel = $('label[for="cmi"]')
const salaireLabel = $('label[for="salaire"]')
const impotLabel = $('label[for="impot"]')

function setLabelPosition() {
	enfantsLabel.style.top = `${
		enfants.offsetTop - enfants.offsetHeight / 1.3
	}px`
	enfantsLabel.style.left = `${enfants.offsetLeft + 5}px`
	enfantsLabel.style.maxWidth = `${enfants.offsetWidth - 20}px`

	cmiLabel.style.top = `${cmi.offsetTop - cmi.offsetHeight / 1.3}px`
	cmiLabel.style.left = `${cmi.offsetLeft + 5}px`
	cmiLabel.style.maxWidth = `${cmi.offsetWidth - 20}px`

	salaireLabel.style.top = `${
		salaire.offsetTop - salaire.offsetHeight / 1.3
	}px`
	salaireLabel.style.left = `${salaire.offsetLeft + 5}px`
	salaireLabel.style.maxWidth = `${salaire.offsetWidth - 20}px`

	impotLabel.style.top = `${impot.offsetTop - impot.offsetHeight / 1.3}px`
	impotLabel.style.left = `${impot.offsetLeft + 5}px`
	impotLabel.style.maxWidth = `${impot.offsetWidth - 20}px`
}

setTimeout(() => {
	setLabelPosition()
}, 500)

window.onresize = () => {
	setLabelPosition()
}

/*
$('view-section').forEach((section) => {
	section.addEventListener('scroll', () => {
		setLabelPosition()
	})
})
*/

window.annee.innerHTML = ''
for (const year in TauxImpot) {
	const option = document.createElement('option')
	option.setAttribute('value', year)
	option.innerText = year
	annee.prepend(option)
	annee.selectedIndex = 0
	//annee.innerHTML += `<option value="${year}">${year}</option>`
}

enfants.addEventListener('change', (e) => {
	let value = parseInt(e.target.value)
	if (value < 0 || value !== parseFloat(e.target.value)) value = 0
	cmi.setAttribute('max', value)
	if (parseInt(cmi.value) > value) cmi.value = value
	enfants.value = value
})

/**
 * Calcul le nombre de parts de quotien familial
 * @param {number} enfants Nombre d'enfants à charge
 * @param {number} cmi Nombre d'enfnats à charge titulaire de la CMI mention invalidité
 * @param {boolean} conjoint Marié ou pacsé
 * @returns {number} Nombre de parts
 */
function calcParts(enfants, cmi, conjoint) {
	return (
		1 +
		cmi * 0.5 +
		(enfants > 2 ? enfants - 1 : enfants * 0.5) +
		(conjoint ? 1 : 0)
	)
}

/**
 * Calcul l'impot sur le revenu
 * @param {number} parts Nombre de parts de quotien familial
 * @param {number} salaire Salaire net annuel
 * @param {object[]} taux Taux d'imposition
 * @return {number} Impot sur le revenu annuel
 */
function calcImpot(parts, salaire, taux) {
	salaire /= parts
	let impot = 0
	if (salaire > taux[1].seuil)
		impot +=
			((salaire > taux[2].seuil ? taux[2].seuil : salaire) -
				taux[1].seuil -
				1) *
			taux[1].taux
	if (salaire > taux[2].seuil)
		impot +=
			((salaire > taux[3].seuil ? taux[3].seuil : salaire) -
				taux[2].seuil -
				1) *
			taux[2].taux
	if (salaire > taux[3].seuil)
		impot +=
			((salaire > taux[4].seuil ? taux[4].seuil : salaire) -
				taux[3].seuil -
				1) *
			taux[3].taux
	if (salaire > taux[4].seuil)
		impot += (salaire - taux[4].seuil - 1) * taux[4].taux
	return Math.round(impot * parts)
}

/**
 * Calcul le salaire minimal octroyant l'impot renseigné
 * @param {number} parts Nombre de parts de quotien familial
 * @param {number} impot Impot sur le revenu annuel
 * @param {object[]} taux Taux d'imposition
 * @return {number} Salaire net annuel
 */
function calcSalaire(parts, impot, taux) {
	let salaire = 0
	do {
		salaire++
	} while (calcImpot(parts, salaire, taux) < impot)
	return salaire
}

/**
 * Trace le diagram d'imposition
 * @param {number} parts Nombre de parts de quotien familial
 * @param {number} salaire Salaire net annuel
 * @param {object[]} taux Taux d'imposition
 * @param {*} taux
 */
function traceImpot(parts, salaire, taux) {
	const seuilArray = taux.map((e) => e.seuil)
	const tauxArray = taux.map((e) => `${Math.round(e.taux * 100)}%`)
	graph.setAttribute('value', salaire / parts)
	graph.setAttribute('label-y', JSON.stringify(tauxArray))
	graph.setAttribute('axe-y', JSON.stringify(seuilArray))
}

$('#submit').addEventListener('click', () => {
	try {
		const salaireVal = parseInt(salaire.value)
		const impotVal = parseInt(impot.value)

		const parts = calcParts(
			parseInt(enfants.value),
			parseInt(cmi.value),
			conjoint.checked
		)

		if (Number.isNaN(parts)) throw 'Erreur lors du calcul des parts'
		if (!Number.isNaN(impotVal) && !Number.isNaN(salaireVal))
			throw 'Tous les champs sont pleins'

		if (Number.isNaN(impotVal) && !Number.isNaN(salaireVal)) {
			impot.value = calcImpot(parts, salaireVal, TauxImpot[annee.value])
			traceImpot(parts, salaireVal, TauxImpot[annee.value])
		} else if (!Number.isNaN(impotVal) && Number.isNaN(salaireVal)) {
			salaire.value = calcSalaire(parts, impotVal, TauxImpot[annee.value])
			traceImpot(parts, parseInt(salaire.value), TauxImpot[annee.value])
		} else {
			throw "Aucune valeure n'à été renseignée"
		}
	} catch (error) {
		console.error(`❌: ${error}`)
		message(error, 'alert')
	}
	setLabelPosition()
})
