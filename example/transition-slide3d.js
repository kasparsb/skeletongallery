var TransitionSlide3d = {
    duration: 500,
    easing: [.42,0,.58,1],
    before: function(oldSlide, newSlide, direction, viewer) {
        this.dimensions = viewer.getDimensions();

        this.width = this.dimensions.width;
        this.height = this.dimensions.height;

        viewer.mountSlide(newSlide);


        var newx = (this.width/2) * (direction == 'next' ? 1 : -1);

        
        if (oldSlide && newSlide) {
            $(newSlide.el).css({
                position: 'absolute',
                top: 0,
                left: 0,
                transform: 'translate3d('+newx+'px, 0, 0) scale(0.5)',
                zIndex: 1
            })
            $(oldSlide.el).css({
                position: 'absolute',
                top: 0,
                left: 0,
                transform: 'translate3d(0, 0, 0)',
                zIndex: 2
            })
        }
        
    },
    after: function(oldSlide, newSlide, direction, viewer) {
        if (oldSlide) {
            viewer.unmountSlide(oldSlide);
        }
    },
    step: function(oldSlide, newSlide, direction, progress, viewer) {
        if (oldSlide && newSlide) {

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
            

            $(newSlide.el).css({
                transform: 'translate3d('+newx+'px, 0, 0) scale('+(newscalex)+')',
                opacity: newopacityx
            });
            $(oldSlide.el).css({
                transform: 'translate3d('+oldx+'px, 0, 0) scale('+(newscaley)+')',
                opacity: newopacityy
            })
        }
    }
}