;var GalleryImage;
(function($){
	/**
	 * Gallery image. Maybe call it slide
	 * @param number Index in gallery
	 * @param variant If element is string, than it is evaluated as image src
	 *               If element is an object, than image src is searched under property src, other object properties
	 *               are stored and can be accesed in image object
	 * @param object Give access to viewer
	 */
	GalleryImage = function( index, imageData, viewer ) {
		this.ready = false;

		this.type = 'image';

		this.viewer = viewer;
		this.index = index;
		
		this.src = this._getSrc( imageData );
		this.data = this._getData( imageData );

		this.$el;

		this.width;
		this.height;
		this.ratio;

		// For image centering verticaly and horizontaly
		this.top;
		this.left;

		this.natural = {
			width: undefined,
			height: undefined
		}
	}

	// Extend GallerySlide prototype
	GalleryImage.prototype = $.extend({
		load: function(cb) {
			var mthis = this;

			if ( this.ready ) {
				cb( mthis );
			}
			else {
				// Wrap images in div element (slide)
				this.$el = $('<div />');
				this.$image = $('<img />').attr('src', this.src).appendTo( this.$el );

				// Image dimensions
				this._readDimensions();

				// Set slide dimensions
				this._applySlide();
				
				// Check if image dimensions was ready. If image is not loaded yet, then dimensions can not be read
				// Attach load event and then read image dimensions
				if ( this.width > 0 || this.height > 0 )
					cb( mthis );
				else
					this.$image.load(function(){
						mthis._readDimensions();

						cb( mthis );
					});

				this.ready = true;
			}
		},

		_getSrc: function( data ) {
			if ( typeof data == 'string' )
				return data;
			else
				return data.src;
		},

		_getData: function( data ) {
			if ( typeof data == 'object' )
				return data;
			else
				return { src: data };
		},

		/**
		 * Read image dimensions
		 */
		_readDimensions: function() {
			this.width = this.$image.get(0).width;
			this.height = this.$image.get(0).height;
			this.ratio = this.width/this.height;

			this.natural.width = this.width;
			this.natural.height = this.height;
		},

		/**
		 * Apply image size to DOM element
		 * Slide DOM properties are also renewed
		 */
		_apply: function() {
			this.$image.css( this._getContentSizingCss() );
			this._applySlide();
		},

		destroy: function() {
			if ( this.$el ) {
				this.$el.remove();
				delete this.$el;

				this.$image.remove();
				delete this.$image;
			}
		}
	}, GallerySlide.prototype);
})(jQuery);