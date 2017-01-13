var _ = require('underscore');
var events = require('./events');
var slides = require('./slides');
var Transition = require('./viewer-transition');
var Swipe = require('./viewer-swipe');

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

    this.preloadThreshold = 4;

    // Iemontēto slide rinda
    this.mountQueue = [];

    this.transition = new Transition(this);
    this.swipe = new Swipe(this);

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

        /**
         * Uzliekam transition eventus
         * Transition ir animācija, kur var notikt noteiktu laiku, tāpēc
         * vajag iespēju piefiksēt, kad notiek šī animācija
         */
        this.transition.on('start', _.bind(function(){
            this.slidesTransitionInProgress = true;
        }, this));

        this.transition.on('end', _.bind(function(){
            this.slidesTransitionInProgress = false;

            this.trigger('change');
        }, this))
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

    startTransitionStepping: function(direction) {
        /**
         * @todo Šo mainīgo pārsaukt savādāk
         */
        this.tempState = {
            newSlide: this.slides[direction == 'next' ? 'getNext' : 'getPrev'](),
            oldSlide: this.slides.active,
            direction: direction
        }

        this.queueSlide(this.tempState.newSlide);
        
        // Uzstādām aktīvo slide
        this.slides.setActive(this.tempState.newSlide);

        // Uzsākam transition
        this.props.transition.before(this.tempState.oldSlide, this.tempState.newSlide, 'next', this);
    },

    setTransitionProgress: function(progress) {
        
        this.props.transition.step(this.tempState.oldSlide, this.tempState.newSlide, 'next', progress, this);
        
    },

    /**
     * Atgriež esošos viewer izmērus
     * @todo Izmērus ir jākešo
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
     * Nomainām slide, sagatavojam transition, bet nepalaižam to
     */
    changeSlide: function(newSlide) {
        if (this.props.checkSlidesTransitionInProgress && this.slidesTransitionInProgress) {
            return false;
        }

        return this.setActiveSlide(newSlide);
    },

    setActiveSlide: function(slide) {
        if (this.slides.isActive(slide)) {
            return false;
        }

        this.slides.setActive(slide);

        return true;
    },

    /**
     * Show slide by index
     */
    show: function(newSlide, direction) {
        // Vecais slide
        var currentSlide = this.slides.active;

        // Turpinām, tikai, ja slide ir nomainīts
        if (this.changeSlide(newSlide)) {

            // Ieliekam slaidu rindā. Ja Viewerī tiek likti vairāki slaidi, tad vajag kontrolēt to secību
            this.queueSlide(newSlide);

            
            /**
             * Šis ir gadījums, kad viewer ir tukšs un tiek ievietots pirmais
             * slide. Tā kā transition notiek tikai starp currentSlide un newSlide
             * tad šajā gadījumā transition nenotiks. Tāpēc vajag šajā vietā veikt
             * slide mount
             */
            if (!currentSlide) {
                this.mountSlide(newSlide);
            }

            

            this.transition
                // Iestartējam transition
                .start()
                .setFrom(currentSlide)
                .setTo(newSlide, direction)
                // Palaižam transition
                .run(direction);
        }
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
    },

    /**
     * Change current loade slides for new ones
     * @param array New slides
     * @param number Slide index to load. If not passed, first slide will be loaded
     */
    replaceItems: function(newItems, index) {
        if (typeof index == 'undefined') {
            index = 0;
        }

        // Unmount currently active slide
        this.unmountSlide(this.slides.active);

        // Replace slides
        this.slides.replaceItems(newItems);

        // Set active slide and mount
        this.slides.setActive(this.slides.get(index));
        this.mountSlide(this.slides.active);
    }
}, events);

module.exports = viewer;