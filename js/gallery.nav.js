;var GalleryNav;
(function($){
	GalleryNav = function( config ) {
		this.viewer = config.viewer;
		this.$prev = config.prev;
		this.$next = config.next;

		this._setEvents();
	}

	GalleryNav.prototype = {
		_setEvents: function() {
			var mthis = this;

			// Keyboard navigation
			this._keyUpHandler = function(ev) {
				switch ( ev.keyCode ) {
					case 39: mthis.next(); break;
					case 37: mthis.prev(); break;
				}
			}
			this._prevClickHandler = function(ev){
				ev.preventDefault();
				mthis.prev();
			}
			this._nextClickHandler = function(ev){
				ev.preventDefault();
				mthis.next();
			}

			$(window).keyup( this._keyUpHandler );

			if ( this.$prev )
				this.$prev.click( this._prevClickHandler );

			if ( this.$next )
				this.$next.click( this._nextClickHandler );
		},

		next: function() {
			this.viewer.next();
		},

		prev: function() {
			this.viewer.prev();
		},

		destroy: function() {
			$(window).unbind( 'keyup', this._keyUpHandler );
			
			if ( this.$prev )
				this.$prev.unbind( 'click', this._prevClickHandler );

			if ( this.$next )
				this.$next.unbind( 'click', this._nextClickHandler );
			delete this.viewer;
		}
	}
})(jQuery);