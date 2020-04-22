$(document).ready(function() {
    initVideoSliders();
    setTimeout(initVideoSliderButtonPrev,100);
});

function initVideoSliders() {
    $('.video-inner-slider').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        nextArrow: $('.video-btn-next'),
        prevArrow: $('.video-btn-prev'),
        centerMode: true,
        dots: false,
        infinite: true,
        cssEase: 'cubic-bezier(0.6, 0.2, 0.2, 1)',
        speed: 2000,
        draggable: false,
        asNavFor: '.slider-video-bg'
    });
    $('.slider-video-bg').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        dots: false,
        infinite: true,
        speed: 1000,
        draggable: false,
        arrows: false,
        cssEase: 'cubic-bezier(0.8, 0.1, 0.1, 1)',
    });
}

function initVideoSliderButtonPrev() {
    $('.video-inner-slider').on('beforeChange',function () {
        $('.video-btn-prev').hide();
        $('.btn-video').hide();
    });
    $('.video-inner-slider').on('afterChange',function () {
        $('.video-btn-prev').show();
        $('.btn-video').show();
    });

}