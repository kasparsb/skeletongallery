var TransitionSlide = {
    duration: 400,

    before: function(viewer, currentSlide, newSlides) {
        currentSlide.css({
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1
        });

        /**
         * @todo Slide mount ir jādara viewer pašam
         */


        var dimensions = this.viewer.getDimensions();
        /**
         * Šajā mirklī nezinam, kurā virzienā notiks transition
         * Tāpēc sagatavojam gan prev, gan next
         */
        if (newSlides.next) {
            viewer.mountSlide(newSlides.next);

            newSlides.next.css({
                position: 'absolute',
                top: 0,
                left: 0,
                transform: 'translate3d('+dimensions.width+'px,0,0)'
            })
        }
        if (newSlides.prev) {
            viewer.mountSlide(newSlides.prev);

            newSlides.prev.css({
                position: 'absolute',
                top: 0,
                left: 0,
                transform: 'translate3d(-'+dimensions.width+'px,0,0)'
            });
        }
    },

    after: function(viewer, currentSlide, newSlides, direction) {
        
        /**
         * @todo šis ir jādara pašam viewer
         */
        currentSlide.css({
            transform: 'none'
        })
        viewer.unmountSlide(currentSlide);

        // Atmontējam next vai prev (atkarībā no tā kurā virzienā notika pārslēgšanās)
        // Swipe gadījumā new slides tiek padots gan pirmais gan pēdējais
        if (direction == 'next' && newSlides.prev) {
            // Novācam savus uzliktos css
            newSlides.prev.css({
                transform: 'none'
            })
            viewer.unmountSlide(newSlides.prev);
        }
        else if (direction == 'prev' && newSlides.next) {
            newSlides.next.css({
                transform: 'none'
            })
            viewer.unmountSlide(newSlides.next);
        }
    },

    step: function(viewer, currentSlide, newSlides, direction, progress) {
        var dimensions = this.viewer.getDimensions();

        if (direction == 'next') {
            var d = (dimensions.width * progress);    
            
            newSlides[direction].css({
                transform: 'translate3d('+(dimensions.width - d)+'px,0,0)'
            });

            
            currentSlide.css({
                transform: 'translate3d(-'+d+'px,0,0)'
            });
        }
        else if (direction == 'prev') {
            var d = (dimensions.width * progress);
            
            newSlides[direction].css({
                transform: 'translate3d(-'+(dimensions.width - d)+'px,0,0)'
            });

            
            currentSlide.css({
                transform: 'translate3d('+d+'px,0,0)'
            });
        }
    }
}

module.exports = TransitionSlide;