var _ = require('underscore');
var media = require('./media');

var mediaImage = function(props) {
	/**
	 * Bildes dabīgie izmēri
	 * Kamēr bilde nav ielādējusie tikmēr width un height ir 0
	 */
	this.natural = {
		width: 0,
		height: 0
	}

	// Šajā gadījumā attēla adrese
	this.src = props.src;

	this.construct();
}

mediaImage.prototype = _.extend(media, {
	create: function() {
		var el = _.createEl('img');
		_.attr(el, 'src', this.src);
		return el;
	},

	checkIsLoaded: function() {
		// Nolasām attēla dimensijas
		this.readDimensions();

		if ( this.natural.width > 0 || this.natural.height > 0 ) {
			// Šajā mirklī uzstādām media kā ielādējušos
			this.setIsLoaded();

			return true;
		}
		else {
			_.on(this.el, 'load', _.bind(this.checkIsLoaded, this));

			return false;
		}
	},

	readDimensions: function() {
		this.natural = {
			width: this.el.width,
			height: this.el.height
		}
	}
});

module.exports = mediaImage;