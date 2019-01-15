var _ = require('./underscore');
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
        // Arī, ja nav bijis valid move piefiksējam, ka touch notikumi beigušies
        this.swipe.on('touchend', _.bind(this.onTouchEnd, this));
    },

    initSwipe: function() {
        var c = {};

        if (this.direction) {
            c.direction = this.direction;
        }

        this.swipe = new swipe(this.viewer.el, c);
    },

    onStart: function(ev) {
        // Nesākam swipe move, ja notiek transition
        if (this.viewer.slidesTransitionInProgress) {
            return;
        }
        
        this._wasMove = false;

        this.swipeStarted = true;
        this.swipeProgress = 0;
        this.animationFrameId = 0;
        this.transitionSteppingStarted = false;

        this.dimensions = this.viewer.getDimensions();
    },

    onMove: function(ev) {
        if (!this.swipeStarted) {
            return;
        }

        var direction = ev.direction;

        this._wasMove = true;

        // Start transition stepping if it is not started
        this.startTransitionStepping();

        this.swipeProgress = ev.width / this.dimensions.width;

        if (!this.animationFrameId) {
            this.animationFrameId = requestAnimationFrame(_.bind(function(){
                
                this.viewer.transition.step(this.getDirection(direction), this.swipeProgress);
                this.animationFrameId = 0;

            }, this));
        }
    },

    onEnd: function(ev) {
        if (!this.swipeStarted) {
            return;
        }
        if (!this._wasMove) {
            return;
        }

        // Turpinām ar animāciju
        var direction = this.getDirection(ev.direction);

        // Uzstādām jauno slide
        this.viewer.setActiveSlide(direction == 'next' ? this.getNext() : this.getPrev());

        // Taisam animāciju
        this.viewer.transition.runFrom(direction, this.swipeProgress);
    },

    onTouchEnd: function() {
        this.swipeStarted = false;
        this._wasMove = false;
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