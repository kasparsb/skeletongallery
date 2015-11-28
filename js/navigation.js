var _ = require('underscore');

var navigation = function(props) {
	// Viewer instance
	this.viewer = props.viewer;

	this.next = props.next;
	this.prev = props.prev;

	this.setEvents();
}

navigation.prototype = {
	setEvents: function() {
		// Navigācijas pogas
		_.on(this.next, 'click', _.bind(function(ev){
			ev.preventDefault();
			this.viewer.next();
		}, this));

		_.on(this.prev, 'click', _.bind(function(ev){
			ev.preventDefault();
			this.viewer.prev();
		}, this));

		// Klaviatūras eventi
		_.on(window, 'keyup', _.bind(function(ev){
			switch ( ev.keyCode ) {
				case 39: this.viewer.next(); break;
				case 37: this.viewer.prev(); break;
			}
		}, this));
	}
}

module.exports = navigation;