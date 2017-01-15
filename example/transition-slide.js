var TransitionSlide = {
    duration: 1000,
    
    easing: [.4,1.44,.38,.34],

    before: function(viewer, currentSlide, newSlides, direction) {
        this.dimensions = viewer.getDimensions();

        this.width = this.dimensions.width;
        this.height = this.dimensions.height;

        viewer.mountSlide(newSlides[direction]);


        var newx = this.width * (direction == 'next' ? 1 : -1);

        var newSlide = newSlides[direction];
        if (currentSlide && newSlide) {
            $(newSlide.el).css({
                position: 'absolute',
                top: 0,
                left: 0,
                transform: 'translate3d('+newx+'px, 0, 0)'
            })
            $(currentSlide.el).css({
                position: 'absolute',
                top: 0,
                left: 0,
                transform: 'translate3d(0, 0, 0)'
            })
        }
        
    },
    after: function(viewer, currentSlide, newSlide, direction) {
        viewer.unmountSlide(currentSlide);
    },
    step: function(viewer, currentSlide, newSlides, direction, progress) {
        if (currentSlide && newSlide) {
            
            
            var newx = (this.width - this.width * progress) * (direction == 'next' ? 1 : -1);
            var oldx = (this.width * progress) * (direction == 'next' ? -1 : 1);
            
            var newSlide = newSlides[direction];
            $(newSlide.el).css({
                transform: 'translate3d('+newx+'px, 0, 0)'
            });
            $(currentSlide.el).css({
                transform: 'translate3d('+oldx+'px, 0, 0)'
            })
        }
    }
}