var _ = require('underscore');
var events = require('./events');
var stepper = require('./stepper');
var transitionSimple = require('./transition-simple');


/**
 * 3 soļi kuri tiek izpildīti veicot transition
 *   - newSlide: kad tiek pievienots jauns slide
 *       slide, direction, viewer
 *   - before: pirms tiek izpildīta transition
 *       currentSlide, viewer
 *   - step: transition animācijas solis
 *       currentSlide, newSlide, direction, progress, viewer
 *   - after: pēc tam, kad transition beidzas
 *       currentSlide, newSlide, direction, viewer
 */
function viewerTransition(viewer) {
    this.name = 'viewerTransitions';

    this.viewer = viewer;

    // Transition. Ja nav definēta, tad izmantojam transitionSimple
    if (viewer.props.transition) {
        this.transition = viewer.props.transition;
    }
    else {
        this.transition = transitionSimple;
    }

    this.stepper = new stepper();
}

viewerTransition.prototype = _.extend({

    /**
     * Uzstādām virzienu, kādā notiek pārslēgšanās 
     * starp slaidiem
     * prev
     * next
     */
    setDirection: function(direction) {
        this.direction = direction;

        return this;
    },

    /**
     * Slide, no kura tiek animēts
     */
    setFrom: function(slide) {
        this.currentSlide = slide;

        return this;
    },

    /**
     * Slide, uz kuru tiek animēts
     */
    setTo: function(slide) {
        if (this.direction) {
            this.newSlides[this.direction] = slide;
        }

        return this;
    },

    start: function() {
        this.newSlides = {
            next: null,
            prev: null
        }
        this.direction = null;
        this.currentSlide = null;

        return this;
    },

    run: function() {
        // Ja nav direction, tad neturpinām
        if (!this.direction) {
            return;
        }

        // Ja nav ne next ne prev slide, tad neturpinām
        if (this.newSlides.next == null && this.newSlides.prev == null) {
            return;
        }

        // Šajā mirklī notiek current slide pozicionēšana
        this.executeTransitionMethod('before');

        this.trigger('start');
        this.stepper.run(
            this.transition.duration,
            this.transition.easing,

            _.bind(this.step, this),

            _.bind(this.end, this)
        );
    },

    step: function(progress) {
        this.executeTransitionMethod('step', [progress]);
    },

    end: function() {
        this.executeTransitionMethod('after');
        this.trigger('end');
    },    

    runFrom: function(progress) {
        this.stepper.runFrom(
            progress,
            this.transition.duration,
            this.transition.easing,

            _.bind(this.step, this),

            _.bind(this.end, this)
        );
    },

    /**
     * Izpildām user definētās transition metodes
     */
    executeTransitionMethod: function(method, extraArguments, replaceArguments) {
        if (this.transition[method]) {
            // Default argumenti, kuri tiek padoti visām transition metodēm
            var args = [
                this.viewer,
                this.currentSlide,
                this.newSlides,
                this.direction
            ];
        
            // Pieliekam extra argumentu, ja tādi ir
            args = args.concat(typeof extraArguments == 'undefined' ? [] : extraArguments);

            // Ja padoti replace args, tad izmantojam tos
            if (replaceArguments) {
                args = replaceArguments;
            }

            this.transition[method].apply(this, args);
        }
    }
}, events);

module.exports = viewerTransition;