var _ = require('underscore');
var events = require('./events');
var stepper = require('./stepper');
var transitionSimple = require('./transition-simple');
var transitionFade = require('./transition-fade');


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
        switch (viewer.props.transition) {
            case 'simple':
                this.transition = transitionSimple;
                break;
            case 'fade':
                this.transition = transitionFade;
                break;
            default:
                this.transition = viewer.props.transition;
        }
    }
    else {
        this.transition = transitionSimple;
    }

    this.stepper = new stepper();
}

viewerTransition.prototype = _.extend({

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
    setTo: function(slide, direction) {
        switch (direction) {
            case 'next':
                this.newSlides.next = slide;
                break;
            case 'prev':
                this.newSlides.prev = slide;
                break;
        }

        return this;
    },

    start: function() {
        this.newSlides = {
            next: null,
            prev: null
        }
        this.currentSlide = null;

        return this;
    },

    run: function(direction) {
        // Ja nav ne next ne prev slide, tad neturpinām
        if (this.newSlides.next == null && this.newSlides.prev == null) {
            return;
        }

        this.beforeStepping();

        this.trigger('start');

        this.stepper.run(
            this.transition.duration,
            this.transition.easing,

            _.bind(function(progress){

                this.step(direction, progress)

            }, this),

            _.bind(function(){
                
                this.end(direction)

            }, this)
        );
    },

    beforeStepping: function() {
        // Šajā mirklī notiek current slide pozicionēšana
        this.executeTransitionMethod('before');
    },

    step: function(direction, progress) {
        this.executeTransitionMethod('step', [direction, progress]);
    },

    end: function(direction) {
        this.executeTransitionMethod('after', [direction]);
        this.trigger('end');
    },    

    runFrom: function(direction, progress) {
        this.stepper.runFrom(
            progress,
            this.transition.duration,
            this.transition.easing,

            _.bind(function(progress){

                this.step(direction, progress)

            }, this),

            _.bind(function(){
                
                this.end(direction)

            }, this)
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
                this.newSlides
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