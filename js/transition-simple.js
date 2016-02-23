var TransitionSimple = {
    after: function(viewer, currentSlide, newSlides, direction) {
        viewer.mountSlide(newSlides[direction]);
        viewer.unmountSlide(currentSlide);
    }
}

module.exports = TransitionSimple;