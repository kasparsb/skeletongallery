/**
 * Globālais namespace, kurā tiek definētas visas Media Viewer klases
 */ 
window.webit = window.webit || {};

(function($){
	/**
	 * Galvenā viewer klase
	 */	
	webit.Viewer = function(config){
		this.config = config;

		/**
		 * When initialized show first image imediately
		 * If false, then no image is loaded unles show(index) is called
		 */
		if ( typeof config.autoOpen == 'undefined' )
			config.autoOpen = true;

		this.$container = config.container;

		// Current slide
		this.current;

		/**
		 * Slaids, kurš pašlaik tiek ielādēts funkcijā show
		 * Slaidam vajag laiku, lai tas ielādētos. Ja tiek ātri pārslēgti slaidi, tad
		 * iepriekšējais slaids vēl var nebūt ielādējies. Toties slaida load callback tiks
		 * izpildīts un iegūsim situāciju, kad 2 vai vairāki slaidi vienlaicīgi izpilda savu load cb
		 */
		this._loadingSlide;

		/**
		 * Array of event listeners
		 */
		this._events = [];

		
		/**
		 * @todo Read through config
		 */
		// Slides change transiton efect
		this.transitionEffect = transitionFade;
		
		// Slide transition interval
		this.transitionInterval = config.transitionInterval || 200;

		/**
		 * Secībā kādā pazūd iepriekšējais slaids.
		 * Iepriekšējais slaids var palikt kamēr notiek jaunā slaida transition
		 *   šāds gadījums ir smuki, ja izmanto sizingMetodi cover, tad notiek pludena attēlu pārmaiņa
		 *	 next-prev
		 *
		 * Iepriekšējais slaids var pazūst pirms sākas nākošā slaida transition
		 *   šāds gadījums der galerijām
		 *	 prev-next
		 */
		this.transitionSequence = config.transitionSequence || 'prev-next';

		/**
		 * Image size method
		 * Predefined methods:
		 *     imageSizeFit
		 *     imageSizeCover
		 *     imageSizeMaxHeight
		 */
		this.imageSizeMethod = this._getSizeMethod( config.sizeMethod );

		// Auto slide change interval. If greater then 0
		this.changeInterval = config.changeInterval;

		/**
		 * Image index which should be showed first
		 * Works only if autoOpen is true
		 */
		this.startWithIndex = config.startWith || 0;

		// Set events
		this._setEvents();
		
		// Set slides
		this._setSlides(config.images);

		// Show first slide
		if ( config.autoOpen )
			this.show( this.startWithIndex );
	}

	/**
	 * Viewer metodes
	 */	
	webit.Viewer.prototype = {
		_setEvents: function() {
			var mthis = this;
			if ( this.changeInterval > 0 )
				this._changeInterval = window.setInterval( function(){
					mthis.next();
				}, this.changeInterval );
		},

		_trigger: function( eventName ) {
			if ( typeof this._events[eventName] == 'object' )
				for ( var i in this._events[eventName] )
					if ( typeof this._events[eventName][i] == 'function' )
						this._events[eventName][i]( this.current );
		},

		/**
		 * Get image size method
		 * @param variant If string, then check for predefined size method. If function, then this is size method
		 */
		_getSizeMethod: function( method ) {
			if ( typeof method == 'function' )
				return method;
			else
				switch ( method ) {
					case 'maxheight': 
						return imageSizeMaxHeight; 
						break;
					case 'fit': 
						return imageSizeFit; 
						break;
					case 'cover':
						return imageSizeCover; 
						break;
					default: 
						return imageSizeDefault; 
						break;
				}
		},

		/**
		 * Setup slides objects
		 * @param array Array of slides.
		 */
		_setSlides: function( slides ) {
			this.slides = [];

			var index = 0;
			for ( var i in slides )
				this.slides.push( new GallerySlide( index++, slides[i], this ) );
		},

		_setCurrent: function( slide ) {
			/**
			 * Tell curren slide to stop whatever it is doing
			 * For example slide with video should stop playing when not visible
			 */
			if ( this.current )
				this.current.stop();

			this.current = slide;
		},

		_validateIndex: function(index) {
			if ( index < 0 )
				return this.slides.length - 1;
			else if ( index >= this.slides.length )
				return 0;
			else
				return index;
		},

		_getCurrentEl: function() {
			if ( this.current )
				return this.current.$el;
			return false;
		},

		/**
		 * Size slide using defined size algorithm
		 * @param object Slide to size
		 * @return object Slide
		 */
		_sizeSlide: function( slide ) {
			if ( typeof this.imageSizeMethod == 'function' )
				this.imageSizeMethod( slide, this );

			return slide;
		},

		_showSlide: function( slide ) {
			var mthis = this;
			this._transitionChange( this._getCurrentEl(), slide.$el, this.$container, function(){
				mthis._setCurrent( slide );	

				mthis._trigger( 'change' );
			} );
		},

		/**
		 * Transition elements (slide) change
		 * @param jQuery-object Current visible element
		 * @param jQuery-object Next element to show
		 * @param jQuery-object Container element when transition should occure
		 */
		_transitionChange: function( $current, $next, $container, cb ) {
			if ( typeof this.transitionEffect == 'function' )
				this.transitionEffect( $current, $next, $container, cb )
			else
				transitionBasic( $current, $next, $container, cb )
		},

		/**
		 * Public API
		 */
		
		/**
		 * Get slide by index. If index not provided, then return current slide
		 */
		getSlide: function(index) {
			var i = this.current ? ( isNaN( index ) ? this.current.index : index ) : ( isNaN( index ) ? 0 : index );
			return this.slides[i];
		},
		next: function() {
			this.show( this._validateIndex( this.current.index+1 ) );
		},
		prev: function() {
			this.show( this._validateIndex( this.current.index-1 ) );
		},
		first: function() {
			this.show( 0 );
		},
		last: function() {
			this.show( this.slides.length - 1 );	
		},
		show: function(index) {
			var mthis = this;

			this._loadingSlide = this.getSlide(index);
			
			// Load slide
			this._loadingSlide.load(function(slide){
				if ( mthis._loadingSlide.index == slide.index ) {
					mthis._showSlide( 
						mthis._sizeSlide( slide )
					);	
				}
			});
		},
		getWidth: function() {
			return this.$container.width();
		},
		getHeight: function() {
			return this.$container.height();
		},
		/**
		 * Get container height without slide
		 */
		getClearHeight: function() {
			// Make sure that current slide does not affect parent dimensions
			var $el = this._getCurrentEl();
			
			var tempDisplay;
			if ( $el ) {
				tempDisplay = $el.css( 'display' );
				// Make display none
				$el.css( 'display', 'none' );
			}

			var h = this.getHeight();

			// Restore display state			
			if ( $el )
				$el.css( 'display', tempDisplay );

			return h;
		},
		destroy: function() {
			if ( this._changeInterval )
				window.clearInterval( this._changeInterval );

			for ( var i in this.slides )
				this.slides[i].destroy();

			delete this.slides;
		},
		on: function( eventName, cb ) {
			if ( typeof this._events[eventName] != 'object' )
				this._events[eventName] = [];
			this._events[eventName].push( cb );
		},
		/**
		 * Set configuration param
		 * @todo Optimizē, lai var jebkādu config parametru uzstādī. Iespējams vajag pārtaisīt config paramtru uzstādīšanu
		 */
		set: function( name, value ) {
			this.config[name] = value;
			if ( 'sizeMethod' )
				this.imageSizeMethod = this._getSizeMethod( value );
		},
		/**
		 * Tell viewer to resize according to parent
		 */
		resize: function() {
			if ( this.current )
				this._sizeSlide( this.current );
		}
	}

	/**
	 * Slides transition effects
	 */
	function transitionDefault( $curr, $next, $c, cb  ) {
		if ( $curr )
			$curr.remove();
		
		$c.append( $next );

		cb();
	}

	function transitionFade( $curr, $next, $c, cb ) {
		
		/**
		 * Lai varētu nodrošināt, ka abi slaidi (esošais un nākošais) ir viens virs
		 * otra, tad taisam tos absolūtus
		 *
		 * Čekojam vai container relative/absolute/fixed. Ja nav neviens no šiem, tad lieka relative
		 */
		var currentSlideCss = {
			zIndex: 10
		};
		var nextSlideCss = {
			opacity: 0,
			zIndex: 11
		};
		if ( this.transitionSequence == 'next-prev' ) {
			var p = $c.css('position');
			if ( ! (p == 'relative' || p == 'absolute' || p == 'fixed') )
				$c.css('position', 'relative');

			// Current un next slaidiem liekam position absolute un top left = 0
			currentSlideCss.position = 'absolute';
			currentSlideCss.top = 0;
			currentSlideCss.left = 0;

			nextSlideCss.position = 'absolute';
			nextSlideCss.top = 0;
			nextSlideCss.left = 0;
		}

		// Esošais slaids ir jānodzēš pirms sāk animēt nākošo
		if ( this.transitionSequence == 'prev-next' ) {
			if ( $curr ) {
				$curr.remove();
				$curr = null;
			}
		}


		if ( $curr ) 
			$curr.css( currentSlideCss );

		$next.css( nextSlideCss ).appendTo( $c ).animate({
			opacity: 1
		}, this.transitionInterval, function(){
			if ( $curr )
				$curr.remove();
			cb();
		});
	}

	
	/**
	 * Slide sizing methods
	 */
	function imageSizeDefault( slide, viewer ) {
		// Scale to width
		slide.sizeToWidth( viewer.getWidth() );
		
		slide._apply();
	}

	function imageSizeFit( image, viewer ) {
		image.sizeToFit();
		image._apply();
	}

	function imageSizeCover( image, viewer ) {
		image.sizeToCover();
		image._apply();	
	}

	/**
	 * Size image so it never is taller than max height
	 * Max height is read from gallery config
	 */
	function imageSizeMaxHeight( image, viewer ) {
		// Scale to width
		image.sizeToWidth( viewer.getWidth() );

		if ( image.height > image.viewer.config.maxheight )
			image.sizeToHeight( image.viewer.config.maxheight );

		image.centerHorizontaly();

		image._apply();
	}

})(jQuery);