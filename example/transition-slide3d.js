var TransitionSlide3d = {
    duration: 1000,
    //easing: [.42,0,.58,1],
    easing: [1,1,1,1],

    before: function(viewer, currentSlide, newSlides, direction) {
        this.dimensions = viewer.getDimensions();

        this.width = this.dimensions.width;
        this.height = this.dimensions.height;

        
        currentSlide.css({
            position: 'absolute',
            top: 0,
            left: 0,
            transform: 'translate3d(0, 0, 0)',
            zIndex: 2
        });


        var x = (this.width/2) * (direction == 'next' ? 1 : -1);

        viewer.mountSlide(newSlides[direction]);

        newSlides[direction].css({
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'block',
            transform: 'translate3d('+x+'px, 0, 0) scale(0.5)',
            zIndex: 1
        })
    },

    step: function(viewer, currentSlide, newSlides, direction, progress) {
        var width = this.width/2;
        var scale = 0.5;
        var opacity = 0.5;

        var scale2 = 0.2;
        var opacity2 = 0.7;
        
        
        var newx = (width - width * progress) * (direction == 'next' ? 1 : -1);
        var oldx = (this.width * progress) * (direction == 'next' ? -1 : 1);

        var newscalex = scale + scale*progress;
        var newscaley = 1 - scale2*progress;

        var newopacityx = opacity + opacity*progress;
        var newopacityy = 1 - opacity2*progress;
        
        var newSlide = newSlides[direction];
        if (newSlide) {
            newSlide.css({
                transform: 'translate3d('+newx+'px, 0, 0) scale('+(newscalex)+')',
                opacity: newopacityx
            });
        }
        currentSlide.css({
            transform: 'translate3d('+oldx+'px, 0, 0) scale('+(newscaley)+')',
            opacity: newopacityy
        })
    },

    after: function(viewer, currentSlide, newSlide, direction) {
        
        viewer.unmountSlide(currentSlide);
        
    }
}