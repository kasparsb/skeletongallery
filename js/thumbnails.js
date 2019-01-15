var _ = require('underscore2');
var events = require('./events');

/**
 * Thumbnails types:
 * - ar bildēm
 * - bumbiņas. Principā vienalga kāds grafiskais elements
 * - counter. i from length - šis pat nav vajadzīgs, jo var klausīties viewer eventus un attiecīgi reaģēt
 * 
 * Horizontāls
 * Vertikāls
 */


var thumbnails = function(props) {
	this.name = 'thumbnails';
	this.props = props;

	this.el = this.create();
	this.items = this.createItems(props.items);

	this.setEvents();
}

thumbnails.prototype = _.extend({
	setEvents: function() {

		// If provided vewier, watch change event
		if (this.props.viewer) {
			this.props.viewer.on('change', _.bind(this.handleChange, this));
		}

		// If next, prev controls, handle click
		if (this.props.next) {
			_.on(this.props.next, 'click', _.bind(function(ev){
				ev.preventDefault();

				this.next();
			}, this))
		}

		if (this.props.prev) {
			_.on(this.props.prev, 'click', _.bind(function(ev){
				ev.preventDefault();

				this.prev();
			}, this))
		}
	},

	handleChange: function() {

	},

	create: function() {
		var el = _.createEl('div');
	},

	createItems: function(items) {
		items.map(function(item){
			var el = this.props.formatter.call(this, item);

			_.append(this.el, el)

			
		}, this)
	}
}, events);

module.exports = thumbnails;