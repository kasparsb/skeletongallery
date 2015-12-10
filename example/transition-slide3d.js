var TransitionSlide3d = {
    duration: 1000,
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
                transform: 'translate('+newx+'px, 0) scale(0.5)',
                zIndex: 1
            })
            $(oldSlide.el).css({
                position: 'absolute',
                top: 0,
                left: 0,
                transform: 'translate(0, 0)',
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
            
            
            var newx = (width - width * progress) * (direction == 'next' ? 1 : -1);
            var oldx = (width * progress) * (direction == 'next' ? -1 : 1);

            var newscalex = scale + scale*progress;
            var newscaley = 1 - scale*progress;
            

            $(newSlide.el).css({
                transform: 'translate('+newx+'px, 0) scale('+(newscalex)+')'
            });
            $(oldSlide.el).css({
                transform: 'translate('+oldx+'px, 0) scale('+(newscaley)+')'
            })
        }
    }
}