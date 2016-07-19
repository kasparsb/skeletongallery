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

    this.initSwipe();
    this.setEvents();
}

viewerSwipe.prototype = {
    setEvents: function() {
        this.swipe.on('start', _.bind(this.onStart, this));
        this.swipe.on('move', _.bind(this.onMove, this));
        this.swipe.on('end', _.bind(this.onEnd, this));
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

        this.swipeStarted = true;
        this.swipeProgress = 0;

        this.transitionSteppingStarted = false;
    },

    onMove: function(ev) {
        if (!this.swipeStarted) {
            return;
        }

        this.startTransitionStepping();

        this.swipeProgress = ev.width / this.dimensions.width;

        this.viewer.transition.step(this.getDirection(ev.direction), this.swipeProgress);
    },

    onEnd: function(ev) {
        if (!this.swipeStarted) {
            return;
        }

        var direction = this.getDirection(ev.direction);

        this.viewer.transition.runFrom(direction, this.swipeProgress);

        // Uzstādām jauno slide
        this.viewer.changeSlide(
            direction == 'next' ? this.getNext() : this.getPrev()
        )
    },

    startTransitionStepping: function() {
        if (this.transitionSteppingStarted) {
            return;
        }

        this.viewer.transition.start();
        this.viewer.transition.setType('swipe');
        // Uzstādām slaid, no kura tiek veikta transition. Tas ir current slide
        this.viewer.transition.setFrom(this.viewer.slides.active);
        // Uzstādām gan next gan prev, jo nevar zināt kādā virzienā notiks swipe
        this.viewer.transition.setTo(this.getNext(), 'next');
        this.viewer.transition.setTo(this.getPrev(), 'prev');
        // Dodam zināt, ka sāksies stepping
        this.viewer.transition.beforeStepping();

        this.transitionSteppingStarted = true;

        return true;
    },

    getDirection: function(swipeDirection) {
        return swipeDirection == 'left' ? 'next' : 'prev'
    },

    getNext: function() {
        return this.viewer.slides.get(this.viewer.slides.active.index + 1);
    },

    getPrev: function() {
        return this.viewer.slides.get(this.viewer.slides.active.index -1);
    }
}

module.exports = viewerSwipe;