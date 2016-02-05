var _ = require('underscore');
var events = require('./events');
var stepper = require('./stepper');

function viewerTransition(viewer) {
    this.name = 'viewerTransitions';

    this.viewer = viewer;
    this.transition = viewer.props.transition;

    this.stepper = new stepper();
}

viewerTransition.prototype = _.extend({

    setDirection: function(direction) {
        this.direction = direction;

        return this;
    },

    setNewSlide: function(slide, direction) {
        // Ja ienāk pirmais slide, tad nav direction
        if (direction) {
            this.newSlides[direction] = slide;
            this.transition.newSlide(slide, direction, this.viewer);
        }

        return this;
    },

    start: function(currentSlide) {
        this.newSlides = {
            next: null,
            prev: null
        }
        this.direction = null;

        this.currentSlide = currentSlide;

        // Šajā mirklī notiek current slide pozicionēšana
        this.transition.before(this.currentSlide, this.viewer);

        return this;
    },

    run: function() {
        // Ja nav direction, tad neturpinam
        if (!this.direction) {
            return;
        }

        // Ja nav ne next ne prev slide, tad neturpinām
        if (this.newSlides.next == null && this.newSlides.prev == null) {
            return;
        }

        this.trigger('start');
        this.stepper.run(
            this.transition.duration,
            this.transition.easing,

            _.bind(this.step, this),

            _.bind(this.end, this)
        );
    },

    step: function(progress) {
        this.transition.step(this.currentSlide, this.newSlides, this.direction, progress, this.viewer);
    },

    end: function() {
        this.trigger('end');
        //this.transition.after(this.currentSlide, this.newSlide, this.direction, this.viewer);
    },


    

    runFrom: function(progress) {
        this.stepper.runFrom(
            progress,
            this.transition.duration,
            this.transition.easing,

            _.bind(this.step, this),

            _.bind(this.end, this)
        );
    }
}, events);

module.exports = viewerTransition;