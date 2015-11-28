var _ = require('underscore');
var events = require('./events');
var slides = require('./slides');

var viewer = function(props, items) {
	this.name = 'viewer';

	this.props = _.extend({
		// Handle window resize and resize viewer
		handleWindowResize: false,
		// Where to switch to first slide when reached end
		rotate: false,
		// Immediatly show first slide
		autoStart: false,
		/**
		 * Pazīme, ka pirms slaidu pārslēgšanas tiek pārbaudīts 
		 * vai slidesTransitionInProgress == true
		 * ja true, tad slaidi netiek pārslēgti, tiek gaidīts kamēr beigsies transition
		 * pretējā gadījumā tiek pārslēgti slaidi un tiek palaists nākošo slides transition
		 */
		checkSlidesTransitionInProgress: true
	}, props);

	this.items = items;

	// Slide Default properties
	this.slideDefaultProps = this.props.slideDefault || {};

	// Elements, kurā jādarbojas viewerim
	this.container = props.container;

	// Viewer elements
	this.el = this.create();

	/**
	 * Pazīme, ka notiek slide transition
	 * Kamēr notiek slide transition tikmēr netiek pārslēgti slide
	 */
	this.slidesTransitionInProgress = false;

	this.preloadThreshold = 2;

	// Iemontēto slide rinda
	this.mountQueue = [];

	this.init();
}

viewer.prototype = _.extend({
	
	init: function() {
		// Slides
		this.slides = new slides(this.items, this);
		this.slides.rotate = this.props.rotate;
		this.slides.preloadThreshold = this.preloadThreshold;
		
		this.setEvents();

		// Check if we need to automaticaly load first slide
		if (this.props.autoStart) {
			this.first();
		}
	},

	setEvents: function() {
		// Check if we need to handle window resize and resize viewer
		if (this.props.handleWindowResize) {
			_.on(window, 'resize', _.debounce(this.handleWindowResize, 100, this));
		}
	},

	handleWindowResize: function() {
		this.resize();
	},

	/**
	 * Create viewer DOM element
	 * Do not make any DOM manipulations on actual container
	 */
	create: function() {
		var el = _.createEl('div');
		var css = {
			display: 'block',
			position: 'relative',
			overflow: 'hidden',
			height: _.height(this.container)
		}
		_.css(el, css);
		_.append(this.container, el);
		return el;;
	},

	/**
	 * Montējam slide, lai tas būt ievietots DOMā
	 * Montējot slide notiek media ielāde, ja tā vēl nav ielādēta
	 */
	mountSlide: function(slide) {
		slide.mount(this.el);
	},

	unmountSlide: function(slide) {
		this.dequeueSlide(slide);
		slide.unmount();
	},

	queueSlide: function(slide) {
		this.mountQueue.push(slide);
		this.setSlidesMountIndexes();
	},

	dequeueSlide: function(slide) {
		var i = -1;
		for (var g in this.mountQueue) {
			if (this.mountQueue[g].index == slide.index) {
				i = g;
				break;
			}
		}
		if (i >= 0) {
			this.mountQueue.splice(i, 1);
		}
		delete slide.mountIndex;
		this.setSlidesMountIndexes();
	},

	setSlidesMountIndexes: function() {
		for (var i = 0; i < this.mountQueue.length; i++) {
			this.mountQueue[i].mountIndex = i;
		}
	},


	/**
	 * Noklusētais slide mount events. Ja un slide mount nav nodefinēts events, tad šis 
	 * būs noklusētais, kurš tiks izpildīts
	 */
	handleSlideMountEvent_mount: function(slide) {
		if (this.slides.isActive(slide)) {
			// Izsaukt attiecīgo event, tikai, kad ienāk active slide
			_.css(this.el, {
				height: slide.media.height
			})
		}
	},

	


	handleDefaultSlideTransition: function(oldSlide, newSlide, direction, callback) {
		// Esošais slide
		if (oldSlide) {
			this.unmountSlide(oldSlide);
		}
		// Nākošais slaids
		if (newSlide) {
			this.mountSlide(newSlide);
		}

		callback();
	},

	handleSlidesTransition: function(oldSlide, newSlide, direction) {
		this.queueSlide(newSlide);

		var transitionDone = _.bind(function() {
			this.slidesTransitionInProgress = false;
			// Saka, ka ir noticis slide change
			this.trigger('change');
		}, this);

		this.slidesTransitionInProgress = true;
		if (this.isListeners('slidetransition')) {
			this.triggerFirst('slidetransition', oldSlide, newSlide, direction, this, transitionDone);
		}
		else {
			this.handleDefaultSlideTransition(oldSlide, newSlide, direction, transitionDone);
		}
	},





	/**
	 * Atgriež esošos viewer izmērus
	 */
	getDimensions: function() {
		return {
			width: _.width(this.el),
			height: _.height(this.el)
		}
	},

	resize: function() {
		_.css(this.el, {
			height: _.height(this.container)
		});

		if (this.slides.active) {
			this.slides.active.resize();	
		}
	},

	/**
	 * Show slide by index
	 */
	show: function(newSlide, direction) {
		if (this.props.checkSlidesTransitionInProgress && this.slidesTransitionInProgress) {
			return;
		}

		// Ja ienāk aktīvais slaids, tad neko nedarām
		if (this.slides.isActive(newSlide)) {
			return;
		}

		// Ja this.active ir inicializēts (lielāks vienāds ar 0)
		var oldSlide = this.slides.active
		
		this.slides.setActive(newSlide);

		// Palaižam slides transition
		this.handleSlidesTransition(oldSlide, newSlide, direction);
	},

	first: function() {
		this.show(this.slides.get(0));
	},

	/**
	 * Navigate to next slide
	 */
	next: function() {
		this.show(this.slides.getNext(), 'next');
	},

	/**
	 * Navigate to prev slide
	 */
	prev: function() {
		this.show(this.slides.getPrev(), 'prev');
	}
}, events);

module.exports = viewer;