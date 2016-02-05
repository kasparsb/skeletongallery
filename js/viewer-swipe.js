var _ = require('underscore');
var swipe = require('swipe');

function viewerSwipe(viewer) {
    this.viewer = viewer;

    /**
     * Viewer dimensijas swipošanas brīdī
     */
    this.dimensions = {}

    // Swipe progress 0 - started, 1 - finished
    this.progress = 0;

    /**
     * Swipe direction. No swipe nosakām, kādā virzienā
     * ir jāpārslēdz slides. Šis var būt atkarīgs no viewer konfigurācijas
     * Horizontālā swipe vertikālā
     * Direction vienmēr būs next vai prev
     */
    this.direction = 'horizontal';

    // Slide, uz kuru mēģina pārslēgties
    this.newSlides = {
        prev: null,
        next: null
    }


    this.initSwipe();
    this.setEvents();
}

viewerSwipe.prototype = {
    setEvents: function() {
        this.swipe.on('start', _.bind(this.onStart, this));
        this.swipe.on('end', _.bind(this.onEnd, this));
        this.swipe.on('move', _.bind(this.onMove, this))
    },

    initSwipe: function() {
        var c = {};

        if (this.direction) {
            c.direction = this.direction;
        }

        this.swipe = new swipe(this.viewer.el, c);
    },

    onStart: function(ev) {
        this.dimensions = this.viewer.getDimensions();

        this.newSlides = {
            prev: null,
            next: null
        }
        this.swipeStarted = true;
        this.swipeProgress = 0;
        this.direction = null;
        this.transitionStarted = false;
    },

    onEnd: function(ev) {
        if (!this.swipeStarted) {
            return;
        }

        this.viewer.transition.runFrom(this.swipeProgress)
    },

    onMove: function(ev) {
        if (!this.swipeStarted) {
            return;
        }

        this.startTransition();

        this.trackDirection(ev);
        this.trackNewSlides();
        this.trackProgress(ev);
    },

    /**
     * Pārbaudām vai vajag sākt transition stepping. Ja ir iesākts stepping,
     * tad neko nedarām
     */
    startTransition: function(direction) {
        if (this.transitionStarted) {
            return;
        }

        this.transitionStarted = true;
            
        this.viewer.transition.start(this.viewer.slides.active);
    },

    trackProgress: function(ev) {
        this.swipeProgress = ev.width / this.dimensions.width;

        this.viewer.transition.step(this.swipeProgress);
    },

    trackDirection: function(ev) {
        this.direction = this.getDirection(ev);

        this.viewer.transition.setDirection(this.direction);
    },

    trackNewSlides: function() {
        return;
        if (!this.newSlides[this.direction]) {
            this.newSlides[this.direction] = this.direction == 'next'
                ? 
                this.viewer.slides.getNext()
                :
                this.viewer.slides.getPrev();


            this.viewer.transition.setNewSlide(
                this.newSlides[this.direction],
                this.direction
            );
        }
    },

    getDirection: function(ev) {
        return ev.offset.x <= 0 ? 'next' : 'prev';
    }
}

module.exports = viewerSwipe;