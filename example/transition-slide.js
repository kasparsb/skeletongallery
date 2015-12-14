var TransitionSlide = {
    duration: 1000,
    
    easing: [.4,1.44,.38,.34],

    before: function(oldSlide, newSlide, direction, viewer) {
        this.dimensions = viewer.getDimensions();

        this.width = this.dimensions.width;
        this.height = this.dimensions.height;

        viewer.mountSlide(newSlide);


        var newx = this.width * (direction == 'next' ? 1 : -1);

        
        if (oldSlide && newSlide) {
            $(newSlide.el).css({
                position: 'absolute',
                top: 0,
                left: 0,
                transform: 'translate3d('+newx+'px, 0, 0)'
            })
            $(oldSlide.el).css({
                position: 'absolute',
                top: 0,
                left: 0,
                transform: 'translate3d(0, 0, 0)'
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
            
            
            var newx = (this.width - this.width * progress) * (direction == 'next' ? 1 : -1);
            var oldx = (this.width * progress) * (direction == 'next' ? -1 : 1);
            

            $(newSlide.el).css({
                transform: 'translate3d('+newx+'px, 0, 0)'
            });
            $(oldSlide.el).css({
                transform: 'translate3d('+oldx+'px, 0, 0)'
            })
        }
    }
}