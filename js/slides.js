var _ = require('./underscore');
var events = require('./events');
var slide = require('./slide');
var mediaImage = require('./media-image');

/**
 * Viewer vajadzīgs, lai
 * 1) Nolasītu no viewer props slideDefault parametrus
 * 2) Klausītos viewer change eventu
 */
var slides = function(items, viewer) {
    this.preloadThreshold = 2;
    this.active = false;
    this.rotate = true;
    this.viewer = viewer;
    
    this.setEvents();

    this.setItems(items);
}

slides.prototype = _.extend({

    /**
     * Sākam veidot slaidus
     */
    create: function(items) {
        return items.map(function(item, index){
            return this.createItem(item, index);
        }, this);
    },

    /**
     * Veidojam slide objektu
     * @param object Slide definition
     * @param number Slide index
     */
    createItem: function(def, index) {
        var o = new slide(
            _.extend(
                _.clone(this.viewer.slideDefaultProps), 
                // ja nav objekts, tad taisām kā objektu
                typeof def == 'object' ? def : { src: def }
            )
        );

        // Katram slide pieglabājam tā index
        o.index = index;
        // Add css class
        _.addClass(o.el, 'slide-'+o.index);

        return o;
    },

    setItems: function(items) {
        this.items = this.create(items);
        this.length = this.items.length;
    },

    setEvents: function() {
        var handlePreload = _.bind(this.handlePreload, this);

        // Kad media ir ielādējusies, tad skatamies vai nevajag veikt nākošo preload
        this.on('media.load', handlePreload);
        // To pašu darām, kad viewerī nomainās slide
        this.viewer.on('change', handlePreload);
    },

    /**
     * Kad media elements ielādējies, skatamies vai vajag preload nākošos
     * Skatamies, lai būt ielādēti vismaz this.active.index + this.preloadThreshold slaidi
     */
    handlePreload: function() {
        var preload = function(items) {
            var loadedAny = false;

            _.each(items, function(slide){
                if (!slide.media.loaded && !slide.media.loading) {
                    slide.media.load();
                    loadedAny = true;
                    return false;
                }
            });

            return loadedAny;
        }

        var start = this.active ? this.active.index : 0;

        // Preload slaidus pa labi no this.active
        var loadedAny = preload(this.get(start, this.preloadThreshold));
        // Ja ir rotate, tad preload slaidus pa kreisi no active
        if (!loadedAny && this.rotate) {
            preload(this.get(start, -this.preloadThreshold))
        }
    },

    /**
     * Is this slide active
     */
    isActive: function(slide) {
        return slide.index == this.active.index;
    },

    setActive: function(slide) {
        this.active = slide;
    },

    /**
     * Get slide by index. If provided count, than return array of slides
     * @param number Slide index
     * @param number How many slides from index to return
     */
    get: function(index, offset) {
        index = _.normalizeIndex(index, this.length);

        if (typeof offset != 'undefined') {
            return _.ranger(index, index+offset, function(i){
                return this.items[_.normalizeIndex(i, this.length)];
            }, this);
        }
        else {
            return this.items[index];
        }
    },

    getByOffset: function(offset) {
        return this.get(_.checkBoundry(this.active ? this.active.index+offset : 0, this.length, this.rotate));
    },

    getNext: function() {
        return this.getByOffset(1);
    },

    getPrev: function() {
        return this.getByOffset(-1);
    },

    replaceItems: function(newItems) {
        this.setItems(newItems);
    }
}, events);

module.exports = slides;