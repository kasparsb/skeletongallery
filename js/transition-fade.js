var TransitionFade = {
    duration: 400,

    before: function(viewer, currentSlide, newSlides, direction) {
        currentSlide.css({
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1
        });

        viewer.mountSlide(newSlides[direction]);
        newSlides[direction].css({
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 2,
            opacity: 0
        })
    },

    after: function(viewer, currentSlide, newSlides, direction) {
        viewer.unmountSlide(currentSlide);
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