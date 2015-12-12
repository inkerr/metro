import * as L from 'leaflet';
import MetroMap from './metro-map';
import * as util from './util';

type FAQData = {faq: { q: string, a: string }[]};

export default class FAQ {
	private button: HTMLButtonElement;
	private card: HTMLDivElement;
	private map: L.Map;
	constructor(map: MetroMap, faqDataUrl: string) {
		const promise: Promise<FAQData> = window['fetch'](faqDataUrl)
		    .catch(err => console.error(err))
			.then(data => data.json());
		this.map = map.getMap();
		this.button = document.createElement('button');
		this.button.id = 'faq-button';
        this.button.textContent = 'FAQ';
        this.button.classList.add('leaflet-control');
        this.button.onclick = this.showFAQ.bind(this);
		document.querySelector('.leaflet-right.leaflet-top').appendChild(this.button);
		this.card = document.createElement('div');
		this.card.id = 'faq-card';
		document.body.appendChild(this.card);
		const closeSpan = document.createElement('div');
		closeSpan.classList.add('cross-ball');
		closeSpan.textContent = 'x';
		closeSpan.addEventListener('click', this.hideFAQ.bind(this));

		this.card.appendChild(closeSpan);
		promise.then(data => {
			for (let qa of data.faq) {
				const qaEl = document.createElement('div');
				qaEl.innerHTML = `<span class="question">${qa.q}</span><span class="answer">${qa.a}</span>`;
				this.card.appendChild(qaEl);
			}
		});

	}

	showFAQ(event: MouseEvent) {
		this.card.style.display = 'inline';
		this.card.style.transform = 'scale(0.1)';
		this.card.getBoundingClientRect();
		this.card.style.transform = null;
		this.button.disabled = true;
		this.map.once('mousedown', e => this.hideFAQ((e as L.LeafletMouseEvent).originalEvent));
	}
	
	hideFAQ(event: MouseEvent) {
		this.card.getBoundingClientRect();
		this.card.style.transform = 'scale(0.1)';
		setTimeout(() => this.card.style.display = 'none', 200);
		this.button.disabled = false;
	}
}