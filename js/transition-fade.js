var TransitionFade = {
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
                zIndex: 2,
                opacity: 0
            })
        }
        if (newSlides.prev) {
            viewer.mountSlide(newSlides.prev);

            newSlides.prev.css({
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 2,
                opacity: 0
            });
        }
    },

    after: function(viewer, currentSlide, newSlides, direction) {
        
        /**
         * @todo šis ir jādara pašam viewer
         */
        viewer.unmountSlide(currentSlide);

        // Atmontējam next vai prev (atkarībā no tā kurā virzienā notika pārslēgšanās)
        // Swipe gadījumā new slides tiek padots gan pirmais gan pēdējais
        if (direction == 'next' && newSlides.prev) {
            viewer.unmountSlide(newSlides.prev);
        }
        else if (direction == 'prev' && newSlides.next) {
            viewer.unmountSlide(newSlides.next);
        }
    },

    step: function(viewer, currentSlide, newSlides, direction, progress) {
        var newSlide = newSlides[direction];
        if (newSlide) {
            newSlide.css({
                opacity: progress
            });
        }
    }
}

module.exports = TransitionFade;