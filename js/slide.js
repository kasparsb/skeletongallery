var _ = require('./underscore');
var events = require('./events');
var mediaImage = require('./media-image');

/**
 * Izveidjot slide, tas pēc noklusējuma nesāk lādēt atbilstošo media
 * Lai sāktu ielādēt media, ir jāizsauc this.media.load un jāklausās load events
 */
var slide = function(props){
    this.name = 'slide';

    var defaultProps = {
        loadingCssClass: 'slide-loading',

        type: 'image',
        src: '',

        // Media default size
        width: '100%',
        height: 'auto',
        maxWidth: '',
        maxHeight: '',
        minWidth: '',
        minHeight: '',
        size: '',
        // Media alignment
        verticalAlign: 'top',
        horizontalAlign: 'center'
    };

    this.props = _.extend(defaultProps, props);

    this.loadingCssClass = this.props.loadingCssClass;

    // Izveidojam media instanci, bet pagaidām to vēl nelādējam
    this.media = new mediaImage({
        src: this.props.src
    });

    // Saglabājam referenci uz slide
    this.media.slide = this;

    this.setMediaEvents();

    /**
     * Pazīme vai slide ir ievietots DOMā
     */
    this.mounted = false;
    this.el = this.create();
}

slide.prototype = _.extend({
    create: function() {
        // Default css, kas tiek uzstādītis slide elementam
        var css = {
            maxWidth: '100%',
            maxHeight: '100%',
            height: '100%',
            width: '100%',
            overflow: 'hidden',
            position: 'relative'
        };

        var el = _.createEl('div');
        _.addClass(el, 'slide');
        _.css(el, css);

        return el;
    },

    setMediaEvents: function() {
        /**
         * Uzstādām slide, ka tas tiek ielādēts
         * Loading state tiek uzlikts false, tikai, kad media ir ielādējusies un iemontēta slaidā
         * Media loading un mounting ir viens process, tikai tas var būt sadalīts divās daļās
         * No sākuma var notikt loading un pēc tam mounting
         */
        this.media.on('beforeload', _.bind(function(){
            
            this.setLoadingState(true);

        }, this));

        // Media ir ielādējies, tagad varam montēt
        this.media.on('load', _.bind(function(){
            /**
             * mountCallback, kurš jāizpilda, kad media ielādēts
             * tas tiek uzstādits, kad slide tiek iemontēts
             * skatīt this.mount
             */
            if (this.media.isLoaded()) {
                if (typeof this.mountMediaLoadCallback == 'function') {
                    this.mountMediaLoadCallback();
                }
            }

        }, this));
    },

    /**
     * Ievietojam slide DOMā
     */
    mount: function(el) {
        if (!this.mounted) {
            _.append(el, this.el);
            this.mounted = true;

            //Šajā mirklī jāskatās vai media ir ielādēta, ja nav, tad tagad ir laiks to darīt
            if (this.media.isLoaded()) {
                // Ja media ir ielādējusies, tad varam montēt media slaidā
                this.mountMedia();
            }
            else {
                /**
                 * Izveidojam callback, kuru izpildīs, kad media būs ielādējusies,
                 * ja slide būs atmonēts uz mirkli, kad media ir ielādējusies, tad
                 * šis callback jau būs nodzēsts un tas neizpildīsies
                 * Taisot unmount šis callback nodzēšanas
                 * Šis callback tiek pārbaudīts un izpildīts this.media.on.load
                 * skatīt this.unmount
                 */
                this.mountMediaLoadCallback = _.bind(this.mountMedia, this);
                this.media.load();
            }
            
        }
    },

    unmount: function() {
        // Nodzēšam mount callback, jo nav jēgas to izpildīt kamēr slide nav iemontēts
        if (typeof this.mountMediaLoadCallback != 'undefined') {
            delete this.mountMediaLoadCallback;
        }

        if (this.mounted) {
            _.remove(this.el);
            this.mounted = false;
        }
    },

    /**
     * Ievietojam media DOMā tikai, kad slide ir ievietots DOMā. 
     * Tas vajadzīgs, lai tiktu noteikti pareizi media izmēri
     * Gadījumā, ja media jau iepriekš bija ielādēts, bet uz mirkli
     * kad media ielādējies, slide jau bija izvākts no DOMa, tad
     * netiek izpildīts mountMedia un slide joprojām ir loading stāvoklī
     * Nākošreiz, kad slide tiks ievietots DOMā mountMedia tiks izpildīts un
     * slide iegūs loaded stāvokli
     */
    mountMedia: function() {
        if (this.mounted) {
            
            var actualMounting = _.bind(function(){
                // Montējot media padodam izmērus
                this.media.mount(
                    this.el,
                    this.getMediaDimensionsProperties()
                );

                this.beforeAlignMedia(alignDone);
            }, this)

            var alignDone = _.bind(function(){
                // Pēc mount
                this.afterMount(mountingDone);
            }, this);

            var mountingDone = _.bind(function(){
                
                this.setLoadingState(false);

                // Paziņojam, ka slide ar media ir iemontēts
                this.trigger('mount', this);

            }, this);

            // Pirms media iemontēšanas
            this.beforeMount(actualMounting);
        }
    },

    /**
     * Callback ir jāizsauc, kad visas darbības ar ievietojamo media ir izdarītas
     */
    beforeMount: function(doneCallback) {
        // Media elements vienmēr ir absolūti pozicionēts, lai būtu vienkāršāk veidot align
        var defaultMediaElCss = {
            position: 'absolute',
            display: 'block'
        }
        
        if (this.isListeners('beforemount')) {
            // Padodam callback funkcijai default MediaEl css
            this.triggerWithCallback('beforemount', doneCallback, this, _.clone(defaultMediaElCss));
        }
        else {
            _.css(this.media.el, defaultMediaElCss);
            doneCallback();
        }
    },

    /**
     * Metode, kas izpildās pēc tam, kad media elements ir ievietots slaidā
     * Šai metodei tiek padots callback, kurš ir jāizsauc, kad visas darbības
     * ar media ir pabeigts un media ir pilnībā ielādēts
     */
    afterMount: function(doneCallback) {
        if (this.isListeners('aftermount')) {
            this.triggerWithCallback('aftermount', doneCallback, this);
        }
        else {
            doneCallback()
        }
    },

    beforeAlignMedia: function(doneCallback) {
        if (this.isListeners('beforealignmedia')) {
            this.triggerWithCallback('beforealignmedia', doneCallback, this);
        }
        else {
            this.alignMedia(doneCallback);
        }
    },

    /**
     * Pozicionējam media elementu atkarībā no padotās konfigurācijas
     */
    alignMedia: function(doneCallback) {
        var css = {}

        css = this.align.y[this.props.verticalAlign](css, this.media);
        css = this.align.x[this.props.horizontalAlign](css, this.media);

        _.css(this.media.el, css);

        if (typeof doneCallback == 'function') {
            doneCallback();
        }
    },

    /**
     * Force slide and media element resize according to new viewer size
     */
    resize: function() {
        // Uzstādām izmērus
        this.media.setDimensions(this.getMediaDimensionsProperties());
        // Align media elementu
        this.alignMedia();
    },

    css: function(cssRules) {
        _.css(this.el, cssRules);
    },

    /**
     * Uzstādām slide loading indikāciju
     */
    setLoadingState: function(isLoading) {
        _[isLoading ? 'addClass' : 'removeClass'](this.el, this.loadingCssClass)
    },

    /**
     * Savācam media dimensions objektu. 
     * Tas tiek padots media, kad to mount vai resize
     */
    getMediaDimensionsProperties: function() {
        var p = {
            width: this.props.width,
            height: this.props.height,
            maxWidth: this.props.maxWidth,
            maxHeight: this.props.maxHeight,
            minWidth: this.props.minWidth,
            minHeight: this.props.minHeight
        }; 

        /**
         * !! Sizing method
         * fit - media iekļaujas atvēlētajā rāmī
         *   width, height - empty
         *   maxWidth, maxHeight: 100%
         * cover - media pārklāj atvēlēto rāmi
         */
        var s = null;
        switch (this.props.size) {
            case 'cover':
                s = this.calculateDimensionsCover();
                break;
            case 'fit':
                s = this.calculateDimensionsFit();
                break;
        }

        if (s) {
            p.width = s.width;
            p.height = s.height;
            p.maxWidth = p.maxWidth ? p.maxWidth : '';
            p.maxHeight = p.maxHeight ? p.maxHeight : '';
            p.minWidth = '';
            p.minHeight = '';
        }
        
        return p;
    },

    /**
     * Aprēķinām media elementa izmērus priekš izmēra Cover
     */
    calculateDimensionsCover: function() {
        var cw = _.width(this.el);
        var ch = _.height(this.el);

        var mw = this.media.natural.width;
        var mh = this.media.natural.height;
        // Malu attiecība
        var mr = mw/mh;

        // Vajag cover izmērus      
        var w = cw;
        var h = w/mr;

        if (h < ch) {
            h = ch;
            w = h*mr;
        }

        return {
            width: w,
            height: h
        }
    },

    /**
     * Aprēķinām media elementa izmērus priekš fit
     */
    calculateDimensionsFit: function() {
        // Container dimensions
        var cw = _.width(this.el);
        var ch = _.height(this.el);

        // Media dimensions
        var mw = this.media.natural.width;
        var mh = this.media.natural.height;
        
        // Ratio
        var mr = mw/mh;

        // Resize to width
        if (mw > cw) {
            // Shrink to fit. Media is larger than container
            var w = cw;
            var h = w/mr;
        }
        else {
            // Do not strech. Media is smaller than container
            var w = mw;
            var h = mh;
        }

        if (h > ch) {
            h = ch;
            w = h*mr;
        }

        return {
            width: w,
            height: h
        }
    },

    /**
     * Align metodes
     */
    align: {
        x: {
            left: function(css, media) {
                css.left = 0;
                return css;
            },
            right: function(css, media) {
                css.right = 0;
                return css;
            },
            center: function(css, media) {
                css.left = '50%';
                css.marginLeft = -(media.width/2)
                return css;
            }
        },
        y: {
            top: function(css, media) {
                css.top = 0;
                return css;
            },
            bottom: function(css, media) {
                css.bottom = 0;
                return css;
            },
            center: function(css, media) {
                css.top = '50%';
                css.marginTop = -(media.height/2)
                return css;
            }
        }
    },
}, events);

module.exports = slide;