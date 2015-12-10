var TransitionSlide = {
    duration: 300,
    easing: [.42,0,.58,1],
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
                transform: 'translate('+newx+'px, 0)'
            })
            $(oldSlide.el).css({
                position: 'absolute',
                top: 0,
                left: 0,
                transform: 'translate(0, 0)'
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
                transform: 'translate('+newx+'px, 0)'
            });
            $(oldSlide.el).css({
                transform: 'translate('+oldx+'px, 0)'
            })
        }
    }
}