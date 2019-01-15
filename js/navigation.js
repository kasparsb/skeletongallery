var _ = require('underscore2');
var events = require('./events');

var navigation = function(props) {
    // Viewer instance
    this.viewer = props.viewer;

    this.props = props;

    this.setEvents();
}

navigation.prototype = _.extend({
    setEvents: function() {
        // Navigācijas pogas
        _.on(this.props.next, 'click', _.bind(function(ev){
            ev.preventDefault();
            this.next();
        }, this));

        _.on(this.props.prev, 'click', _.bind(function(ev){
            ev.preventDefault();
            this.prev();
        }, this));

        // Klaviatūras eventi
        _.on(window, 'keyup', _.bind(function(ev){
            switch ( ev.keyCode ) {
                case 39: this.next(); break;
                case 37: this.prev(); break;
            }
        }, this));
    },

    next: function() {
        var i = this.viewer.slides.active.index;

        this.viewer.next();

        this.hasChanged(i, 'next');
    },

    prev: function() {
        var i = this.viewer.slides.active.index;

        this.viewer.prev();

        this.hasChanged(i, 'prev');
    },

    hasChanged: function(lastIndex, direction) {
        if (this.viewer.slides.active.index == lastIndex) {
            this.trigger('notchanged', direction);
        }
    }
}, events);

module.exports = navigation;