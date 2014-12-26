;var GallerySlide;
(function($){	
	GallerySlide = function( index, data, viewer ) {
		// Determine slide type
		if ( typeof data == 'object' ) {
			if ( typeof data.src != 'undefined' )
				return new GalleryImage( index, data, viewer );
			else if ( typeof data.iframe != 'undefined' )
				return new GalleryIFrame( index, data, viewer );
		}

		return new GalleryImage( index, data, viewer );
	};

	GallerySlide.prototype = {
		/**
		 * Get slide width. 
		 * Slide width depends on content sizing method. It could be viewer width or content width
		 */
		_getSlideWidth: function() {
			return this.viewer.getWidth();
		},

		/**
		 * Get slide height. 
		 * Slide height depends on content sizing method. It could be viewer height or content height
		 */
		_getSlideHeight: function() {
			var vh = this.viewer.getClearHeight();

			if ( this.viewer.config.sizeMethod == 'cover' ) {
				return vh;
			}
			
			return this.height <= vh ? vh : this.height;
		},

		sizeToWidth: function(w) {
			this.width = w;
			this.height = this.width/this.ratio;

			return this;
		},

		sizeToHeight: function(h) {
			this.height = h;
			this.width = this.height*this.ratio;

			return this;
		},

		/**
		 * Size slide content so it fits viewer dimensions
		 * When sized center venrticaly and horzontaly
		 */
		sizeToFit: function() {
			this.sizeToWidth( this.viewer.getWidth() );
		
			// Scale to height. Make sure, that image width do not exceed boundries
			if ( this.height > this.viewer.getHeight() )
				this.sizeToHeight( this.viewer.getHeight() );

			this.centerVerticaly();
			this.centerHorizontaly();
		},

		sizeToCover: function() {
			this.sizeToWidth( this.viewer.getWidth() );	

			if ( this.height < this.viewer.getHeight() )
				this.sizeToHeight( this.viewer.getHeight() );

			this.centerVerticaly();
			this.centerHorizontaly();
		},

		/**
		 * Center slide content horizontaly
		 */
		centerHorizontaly: function() {
			this.left = ( this._getSlideWidth() - this.width ) / 2;

			return this;
		},

		/**
		 * Center slide content verticaly
		 */
		centerVerticaly: function() {
			this.top = ( this._getSlideHeight() - this.height ) / 2;

			return this;
		},

		/**
		 * Align slide content to slide top
		 */
		topVerticaly: function() {
			this.top = 0;			

			return this;
		},

		/**
		 * Generate content css properties object
		 */
		_getContentSizingCss: function() {
			var css = {
				width: this.width,
				height: this.height
			};

			if ( !isNaN( this.top ) )
				css.marginTop = this.top+'px';
			
			if ( !isNaN( this.left ) )
				css.marginLeft = this.left+'px';

			return css;
		},

		/**
		 * Apply slide sizes to slide dom element
		 */
		_applySlide: function() {
			var css = {
				// Width should be viewer width, so slide takes up all spave horizontaly. That way we can center image
				width: this._getSlideWidth(),
				// Get image height. So image can expands its parent
				height: this._getSlideHeight(),
				// Lai img (utt) margin top stieptu parnetu. Ja nav overdlow hidden, tad margin lien ārpus parenta
				overflow: 'hidden'
			};

			if ( !isNaN( this.top ) )
				css.height -= this.top;

			if ( !isNaN( this.left ) )
				css.width -= this.left;

			this.$el.css( css );
		},

		/**
		 * Stop any animation/movement in slide. For example stop playing video when slide is changed
		 */
		stop: function() {

		}
	}

})(jQuery);