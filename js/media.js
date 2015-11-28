var _ = require('underscore');
var events = require('./events');

var media = _.extend({
	construct: function(props) {
		this.name = 'media';

		this.props = props;

		/**
		 * Pazīme, ka media lādējās
		 */
		this.loading = false;

		/**
		 * Iekšējais mainīgais. Pazīme, ka media ir ielādējusies
		 */
		this.loaded = false;

		/**
		 * Pazīme, ka media elements ir ievietots DOMā
		 */
		this.mounted = false;

		this.el = false;

		/**
		 * Media tiek ielādēts izsaucot metodi load
		 * Kamēr šī metode nav izsaukta tikmēr nekas saistīts ar DOM netiek darīts
		 */
	},

	/**
	 * Izveidojam Media DOM elementu un sākam media ielādēšanu
	 */
	load: function() {
		// Media elements (image utt)
		if (!this.el) {
			this.loading = true;
			this.trigger('beforeload', this);
			this.el = this.create();
			// Pārbaudām vai media elements ir ielādējies
			this.checkIsLoaded();
		}
	},

	/**
	 * !!Katrs media tips nodefinēš šo metodi
	 * 
	 * Veidojam media elementu.
	 */
	create: function() {
		console.warn('Define media create method');
	},

	/**
	 * !!Katrs media tips nodefinēs šo metodi
	 *
	 * Šeit pārbaudām vai attēls ir ielādējies un var nolasīt tā izmērus
	 * Ja attēls ir ielādējies un izmēri ir nolasīti palaižam load eventu
	 */
	checkIsLoaded: function() {
		console.warn('Define media checkIsLoaded method');
	},

	/**
	 * Metode, kuru izsauc, kad media elements ir ielādējies
	 */
	setIsLoaded: function() {
		this.loading = false;
		this.loaded = true;
		this.trigger('load', this);	
	},

	/**
	 * Atgriežam pazīmi, ka media ir ielādējusies
	 */
	isLoaded: function() {
		return this.loaded;
	},

	/**
	 * Liekam media elementu DOMā un uzstādām platumu, augstumu, lai
	 * media elements ieņem savu izmēru
	 */
	mount: function(target, width, height, maxWidth, maxHeight) {
		if (!this.mounted) {
			_.append(target, this.el);
			this.mounted = true;
		}
		this.setDimensions(width, height, maxWidth, maxHeight);
	},

	/**
	 * Uzstādām media elementa platumu un augstumu
	 * Katrs media elements var pārrakstīt šo metodi pēc savām vajadzībām
	 * Pēc noklusējuma tiek uzstādīts css: {width, height, maxWidth, maxHeight}
	 */
	setDimensions: function(width, height, maxWidth, maxHeight) {

		/**
		 * !! Sizing method
		 * fit - media iekļaujas atvēlētajā rāmī
		 *   width, height - empty
		 *   maxWidth, maxHeight: 100%
		 * cover - media pārklāj atvēlēto rādmi
		 */

		var css = {
			width: width,
			height: height,
			maxWidth: maxWidth,
			maxHeight: maxHeight
		}
		_.css(this.el, css);

		this.readRealDimensions();
	},

	/**
	 * Nolasām esošos izmēru, kādi tie ir redzami uz ekrāna, pikseļos
	 */
	readRealDimensions: function() {
		this.width = _.width(this.el);
		this.height = _.height(this.el);
	}
}, events);

module.exports = media;
