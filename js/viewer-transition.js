var _ = require('underscore');
var events = require('./events');
var stepper = require('./stepper');
var transitionSimple = require('./transition-simple');
var transitionFade = require('./transition-fade');
var transitionSlide = require('./transition-slide');

function getTransition(transition) {
    switch (transition) {
        case 'simple':
            return transitionSimple;
            break;
        case 'fade':
            return transitionFade;
            break;
        case 'slide':
            return transitionSlide;
            break;
        default:
            return transition;
    }
}

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

    this.transition = {
        // Transition priekš prev, next metodēm
        default: null,
        // Transition priekš swipe (touchscreen)
        swipe: null
    }

    // Transition. Ja nav definēta, tad izmantojam transitionSimple
    if (viewer.props.transition) {
        this.transition.default = getTransition(viewer.props.transition);
    }
    else {
        this.transition.default = transitionSimple;
    }

    /** 
     * Swipe gadījumā tiek definēta cita transition
     */
    if (viewer.props.transitionSwipe) {
        this.transition.swipe = getTransition(viewer.props.transitionSwipe);
    }
    else {
        this.transition.swipe = transitionSlide;
    }

    // Run transitions init methods
    for (var t in this.transition) {
        if (this.transition.hasOwnProperty(t)) {
            if (this.transition[t].init) {
                this.transition[t].init(this.viewer);
            }
        }
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

    setType: function(type) {
        this.transitionType = type;
    },

    start: function() {
        this.newSlides = {
            next: null,
            prev: null
        }
        this.currentSlide = null;
        this.transitionType = 'default';

        return this;
    },

    run: function(direction) {
        // Ja nav ne next ne prev slide, tad neturpinām
        if (this.newSlides.next == null && this.newSlides.prev == null) {
            return;
        }

        this.beforeStepping();        

        this.stepper.run(
            this.getTransition().duration,
            this.getTransition().easing,

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

        this.trigger('start');
    },

    step: function(direction, progress) {
        this.executeTransitionMethod('step', [direction, progress]);
    },

    end: function(direction) {
        this.executeTransitionMethod('after', [direction]);
        this.trigger('end');
    },    

    runFrom: function(direction, progress, endCallback) {
        this.stepper.runFrom(
            progress,
            this.getTransition().duration,
            this.getTransition().easing,

            _.bind(function(progress){

                this.step(direction, progress)

            }, this),

            _.bind(function(){

                this.end(direction)

                // Ja ir padots end callback
                if (endCallback) {
                    endCallback();
                }
                
            }, this)
        );
    },

    /**
     * Izpildām user definētās transition metodes
     */
    executeTransitionMethod: function(method, extraArguments, replaceArguments) {
        if (this.getTransition()[method]) {

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

            this.getTransition()[method].apply(this, args);
        }
    },

    getTransition: function() {
        return this.transition[this.transitionType];
    }
}, events);

module.exports = viewerTransition;