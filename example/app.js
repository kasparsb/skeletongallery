var V = new window.webit.skeletonGallery.viewer(
    // Viewer props
    {
        container: $('#g').get(0),
        rotate: true,
        autoStart: true,
        handleWindowResize: true,
        checkSlidesTransitionInProgress: true,
        slideDefault: {
            size: 'cover'
        },

        transition: TransitionSlide3d

        
        // Default vērtības, kuras tiek izmantotas, ja item'am tāds nav norādītas
        // ,slideDefault: {
        //  width: '',
        //  height: '',
        //  maxWidth: '100%',
        //  maxHeight: '100%',
        //  verticalAlign: 'center',
        //  horizontalAlign: 'center'
        // }
    }, 
    // Viewer slides
    [
        // Image var būt kā strings (url uz bildi) vai kā objekts, kurā norāda
        // netikai bildes url, bet arī vēlamos izmērus
        'https://farm1.staticflickr.com/323/18519058198_ee3de56d05_k.jpg',
        'https://farm7.staticflickr.com/6226/6365397157_178f833cf9_b.jpg',
        {
            size: '',
            type: 'image',
            src: 'https://farm1.staticflickr.com/346/18721202881_b4dfabffd9_k.jpg',
            width: '50%',
            horizontalAlign: 'center',
            //loadingCssClass: 'xcvxcv'
        },
        {
            src: 'https://farm1.staticflickr.com/261/18557421739_965a238bc5_k.jpg'
        },
        {
            src: 'https://farm1.staticflickr.com/364/18728105725_a4d97ad48d_k.jpg'
        },
        'https://farm1.staticflickr.com/492/18111059973_bf0d4d38f8_b.jpg',
        'https://farm9.staticflickr.com/8860/18126752334_1eb45ffc10_h.jpg',
        'https://farm1.staticflickr.com/283/18114357684_1497d4e18a_h.jpg',
        'https://farm1.staticflickr.com/504/18734987615_b76d794349_k.jpg',
        'https://farm1.staticflickr.com/404/18740159701_93e16c8b57_k.jpg'
    ]
);

// V.on('viewer.slidetransition', function(oldSlide, newSlide, direction, viewer, callback){
    
//     if (oldSlide && newSlide) {
//         var vd = viewer.getDimensions();

        
//         xnew = (direction == 'next' ? vd.width : -vd.width);
//         xoldafter = (direction == 'next' ? -vd.width : vd.width);
        

//         $(oldSlide.el).css({
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             transform: 'translate3d(0,0,0)',
//             transition: 'all, 700ms',
//             zIndex: 100 + oldSlide.mountIndex
//         });
//         $(newSlide.el).css({
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             transform: 'translate3d('+xnew+'px,0,0)',
//             transition: 'all, 700ms',
//             zIndex: 100 + newSlide.mountIndex
//         });

//         viewer.mountSlide(newSlide);

//         window.setTimeout(function(){
//             $(oldSlide.el).css({
//                 transform: 'translate3d('+xoldafter+'px,0,0)'
//             });
//             $(newSlide.el).css({
//                 transform: 'translate3d(0,0,0)'
//             })
//         }, 0);

//         window.setTimeout(function(){
//             viewer.unmountSlide(oldSlide);
//             callback();
//         }, 800)

        

        
        
//     }
//     else {
//         if (oldSlide) {
//             viewer.unmountSlide(oldSlide);
//         }
//         if (newSlide) {
//             viewer.mountSlide(newSlide);
//         }

//         callback();
//     }
// });

// V.on('slide.mount', function(slide){
//     // Izsaukt attiecīgo event, tikai, kad ienāk active slide
//     // $(V.el).animate({
//     //  height: slide.media.height
//     // }, 200)
// });

// V.on('slide.beforemount', function(callback, slide, defaultCss){
    
//     // Taisām reveal animāciju tikai, ja slide nav iemontēts
//     if (!slide.media.mounted) {
//         defaultCss.opacity = 0;
        
//         $(slide.media.el).css(defaultCss);

//         slide.media.needRevealAnimation = true;
//     }
//     callback();
// });

// V.on('slide.aftermount', function(callback, slide){
    

//     if (slide.media.needRevealAnimation) {
//         $(slide.media.el).stop().animate({
//             opacity: 1
//         }, 2000, function(){
//             callback();
//         });

//         delete slide.media.needRevealAnimation;
//     }
// });

var N = new window.webit.skeletonGallery.navigation({
    viewer: V,
    next: $('#gnext').get(0),
    prev: $('#gprev').get(0)
});

// var T = new window.webit.skeletonGallery.thumbnails({
//     viewer: V,
//     container: $('#t').get(0),
//     next: $('#t .next').get(0),
//     prev: $('#t .prev').get(0),
//     type: '',
//     formatter: function(item) {
//         return $('<div />').append($('<img />').attr('src', item.src))
//     }
// })

//V.first();




$('#startransitionstepping').on('click', function(){
    V.startTransitionStepping();
});
$('#steppingprogress').on('change', function(){
    V.setTransitionProgress(parseFloat($(this).val().replace(',', '.')));
})