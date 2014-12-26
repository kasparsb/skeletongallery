;var GalleryThumbnails;
(function($){
	GalleryThumbnails = function( config ) {
		// Is iPhone, iPad, iPod
		this.isIos = navigator.userAgent.match(/(iPod|iPhone|iPad)/);
		this.isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1;

		this.$container = config.container;

		this.viewer = config.viewer;
		this.images = config.images;
		/**
		 * Image wrap callback
		 * Function must return image wrapped in neccessary element
		 */
		this.wrap = typeof config.wrap == 'function' ? config.wrap : this._defaultWrap;
		/**
		 * Css class for active thumbnail
		 */
		this.activeClass = config.activeClass || '';
		
		// Thumbnail items
		this._items = [];
		// Active item
		this._activeItem;
		// Total width of thumbnail elements
		this._totalWidth = 0;

		this._outputThumbnailElements();
		this._setEvents();

		if ( this.isIos ) {
			this.$container.css({
				'overflow-y': 'scroll',
  				'-webkit-overflow-scrolling': 'touch'
			});
		}
		else if ( this.isAndroid ) {
			this.$container.css( 'overflow-y', 'scroll' )
		}
		else {
			this.$container.css( 'overflow', 'hidden' )
		}
	}

	GalleryThumbnails.prototype = {
		_setEvents: function() {
			var mthis = this;

			// Thumbnails click. Change clicked image
			$(this._items).each(function(){
				this.click(function(ev){
					ev.preventDefault();

					mthis.viewer.show( $(this).data('index') );
				});
			});

			// Listen to viewer image change
			this.viewer.on( 'change', function(image) {
				mthis._setActive( image.index );
				mthis._center();
			} )
		},

		_setActive: function( index ) {
			if ( this._activeItem )
				this._activeItem.removeClass( this.activeClass );

			this._activeItem = this._items[index].addClass( this.activeClass );
		},
		
		/**
		 * Populates container with thumbnail elements
		 */
		_outputThumbnailElements: function() {
			var index = 0;
			for ( var i in this.images ) {

				var $e = this._getImage( index++, this.images[i] ).appendTo( 
					this.$container 
				);

				this._countTotalWidth( $e );

				this._items.push( $e );
			}
		},

		_countTotalWidth: function( $thumb ) {
			var mthis = this;

			var cb = function( $el ) {
				mthis._totalWidth += $el.outerWidth( true );	
			}

			var $image = $thumb.find('img');

			if ( $image.get(0).width > 0 || $image.get(0).height > 0 )
				cb( $thumb );
			else
				$image.load( (function( $el ){
					return function(){
						cb( $el )
					}
				})( $thumb ) );
		},

		/**
		 * Create thumbnail element. Wrapped if provided wrap callback
		 * Thumbnail element must be display:inline-block
		 */
		_getImage: function( index, src ) {
			return this.wrap( 
				$('<img />')
				    .attr( 'src', src )
					.css({
						height: this.$container.height(),
						width: 'auto'
					})
				).data( 'index', index );
		},

		/**
		 * Default callback for wraping thumbnail image
		 */
		_defaultWrap: function( $img ) {
			return $img;
		},

		_center: function() {
			if ( this._totalWidth < this.$container.width() ) {
				this._centerThumbnails();
			}
			else {
				this._centerActive();
			}
		},

		_centerThumbnails: function() {
			var of = Math.round( ( this.$container.width() / 2 ) - ( this._totalWidth / 2 ) );
			this._items[0].css( 'margin-left', of );
		},

		_centerActive: function() {
			var s = this.$container.scrollLeft();
			var d = ( s + this._activeItem.position().left ) + ( this._activeItem.outerWidth( true ) / 2 );
			var l = this.$container.width() / 2;
			var f = Math.round( d - l );

			this.$container.animate({ 
				scrollLeft: f 
			}, 300);
		},

		destroy: function() {
			for ( var i in this._items )
				this._items[i].remove();
			delete this._items;
		}
	}
})(jQuery);