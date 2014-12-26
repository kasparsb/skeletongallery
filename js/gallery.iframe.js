;var GalleryIFrame;
(function($){
	
	GalleryIFrame = function( index, data, viewer ) {
		this.ready = false;

		this.type = 'iframe';

		this.viewer = viewer;
		this.index = index;

		this.html = this._getHTML( data );
		this.data = this._getData( data );
		
		this.$el;
	}

	// Extend GallerySlide prototype
	GalleryIFrame.prototype = $.extend({
		load: function(cb) {
			if ( !this.$el )
				this.$el = $('<div />');

			this.$el.html( this.html );
			this._readDimensions();
			this._applySlide();
			
			this.ready = true;

			if ( typeof cb == 'function' )
				cb( this );
		},

		/**
		 * Try to extract width and height properties from iframe markup
		 */
		_readDimensions: function() {
			var m = this.html.match( /width\=\"([^\"]*)\"/i );
			if ( m.length > 1 )
				this.width = parseInt( m[1], 10 );
			
			m = this.html.match( /height\=\"([^\"]*)\"/i );
			if ( m.length > 1 )
				this.height = parseInt( m[1], 10 );

			this.ratio = this.width/this.height;
		},

		_getHTML: function( data ) {
			if ( typeof data == 'string' )
				return data;
			else if ( data.iframe )
				return data.iframe;
			else
				return '';
		},

		_getData: function( data ) {
			if ( typeof data == 'object' )
				return data;
			else
				return { iframe: data };
		},

		_apply: function() {
			this.$el.find('iframe').css( this._getContentSizingCss() );
			this._applySlide();
		},

		stop: function() {
			this.$el.html( '' );
		},

		destroy: function() {
			if ( this.$el ) {
				this.$el.remove();
				delete this.$el;
			}
		}
	}, GallerySlide.prototype );
})(jQuery);