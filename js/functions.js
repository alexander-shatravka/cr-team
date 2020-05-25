$(document).ready(function () {
  initFixedHeader();
  initVideoSliders();
  setTimeout(initVideoSliderButtonPrev, 100);
  initFormCustomFocus();
  initFormCustomPlaceholder();
  // initSrollUpCtaButton();
  initFormFileAttachment();
  initCustomScroll();
  initAnchorsScroll();
  initMobileMenu();
  initTelegramForms();
});

function initAnchorsScroll() {
  $(document).on('click', 'a.anchor-link[href^="#"]', function (event) {
    event.preventDefault();

    $('html, body').animate({
      scrollTop: $($.attr(this, 'href')).offset().top
    }, 500);
  });
}

function initCustomScroll(){

  if ($(window).width() > 768) {
    jcf.replaceAll();
    var enableScrollFocus = true;

    $('.services-head-section .jcf-scrollable').on('scroll', function (e) {
      e.preventDefault();
      if (enableScrollFocus) {
        e.preventDefault();
        $('html, body').animate({
          scrollTop: $('.services-head-section').offset().top - 60
        }, 500);
        enableScrollFocus = false;
        return false;
      }
    })
    $('.services-head-section').on('mouseleave', function () {
      enableScrollFocus = true;
    })
  }
}

function initFixedHeader() {
  var fixedItem = jQuery("header"),
    win = jQuery(window);
  win.on('load resize scroll', function (e) {
    var winTop = win.scrollTop();
    if ($(window).width() > 0) {
      if (winTop && winTop > 50) {
        fixedItem.addClass("fixed");
      } else {
        fixedItem.removeClass("fixed");
      }
      pointRemember = winTop;
    }
    // else fixedItem.addClass("slideUp");
  });
}

function initMobileMenu() {
  $('.burger-btn').on('click', function () {
      $(this).toggleClass('active');
      $('.main-nav').toggleClass('mobile-show');
  })
}

// function initSrollUpCtaButton() {
//     var lastScrollTop = 0;
//     $(window).scroll(function(event){
//         var st = $(this).scrollTop();
//         if (st > lastScrollTop){
//             $('.header-cta-block').removeClass('show');
//         } else {
//             $('.header-cta-block').addClass('show');
//         }
//         lastScrollTop = st;
//     });
// }

function initVideoSliders() {
  $('.video-inner-slider').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: $('.video-btn-next'),
    prevArrow: $('.video-btn-prev'),
    dots: false,
    infinite: true,
    cssEase: 'cubic-bezier(0.6, 0.2, 0.2, 1)',
    speed: 1500,
    draggable: false,
    asNavFor: '.slider-video-bg'
  });
  $('.slider-video-bg').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    dots: false,
    infinite: true,
    speed: 750,
    draggable: false,
    arrows: false,
  });
  $('.video-inner-slider-2').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: $('.video-btn-next-2'),
    prevArrow: $('.video-btn-prev-2'),
    centerMode: true,
    dots: false,
    infinite: true,
    cssEase: 'cubic-bezier(0.6, 0.2, 0.2, 1)',
    speed: 1500,
    draggable: false,
    asNavFor: '.slider-video-bg-2'
  });
  $('.slider-video-bg-2').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    dots: false,
    infinite: true,
    speed: 750,
    draggable: false,
    arrows: false,
  });
  $('.portfolio-page .portfolio-grid-wrapper').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    dots: false,
    infinite: true,
    speed: 750,
    nextArrow: $('.portfolio-next'),
    prevArrow: $('.portfolio-prev')
  });
  $('.home-page .portfolio-grid-wrapper').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    dots: false,
    infinite: true,
    speed: 750,
    nextArrow: $('.portfolio-arrow-next'),
    prevArrow: false,
    asNavFor: $('.portfolio-nav-slider')
  });
  $('.home-page .portfolio-nav-slider').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    dots: false,
    vertical: true,
    infinite: true,
    speed: 750,
    draggable: false,
    arrows: false
  });
  $('.home-page .portfolio-nav-slider').on('afterChange', function () {
    $('.next-name').text($('.portfolio-nav-slider .slick-active').next().text())
  })
  // $('.services-slider').slick({
  //     slidesToShow: 1,
  //     slidesToScroll: 1,
  //     vertical: true,
  //     arrows: false,
  //     dots: true,
  //     asNavFor: $('.section-shapes-slider'),
  //     speed: 1000,
  // })
  // $('.section-shapes-slider').slick({
  //     slidesToShow: 1,
  //     slidesToScroll: 1,
  //     vertical: true,
  //     arrows: false,
  //     dots: false,
  //     speed: 500,
  // })
}

function initVideoSliderButtonPrev() {
  $('.video-inner-slider').on('beforeChange', function () {
    $('.video-btn-prev').hide();
    $('.btn-video').hide();
  });
  $('.video-inner-slider').on('afterChange', function () {
    $('.video-btn-prev').show();
    $('.btn-video').show();
  });

  $('.video-inner-slider-2').on('beforeChange', function () {
    $('.video-btn-prev-2').hide();
    $('.btn-video').hide();
  });
  $('.video-inner-slider-2').on('afterChange', function () {
    $('.video-btn-prev-2').show();
    $('.btn-video').show();
  });
}

function initFormCustomFocus() {
  $('.brief-form input').on('blur', function () {
    $('.input-wrapper').removeClass('focused');
    if ($(this).val()) {
      $(this).parents('.input-wrapper').find('.placeholder').addClass('hide');
    } else {
      $(this).parents('.input-wrapper').find('.placeholder').removeClass('hide');
    }
  });
  $('.brief-form input').on('focus', function () {
    $(this).parents('.input-wrapper').addClass('focused');
  })
}

function initFormCustomPlaceholder() {

}

function initFormFileAttachment() {
  (function (document, window, index) {
    var inputs = document.querySelectorAll('.inputfile');
    Array.prototype.forEach.call(inputs, function (input) {
      var label = input.nextElementSibling,
        labelVal = label.innerHTML;

      input.addEventListener('change', function (e) {
        if (this.files && this.files.length <= 2) {
          var files = e.target.files;

          var output = [];
          for (var i = 0, f; f = files[i]; i++) {
            output.push('<li><i class="fas fa-file"></i>', escape(f.name), '</li>');
          }
          label.querySelector('#list').innerHTML = output.join('');
        } else if (this.files && this.files.length >= 3) {
          var fileName = '';
          if (this.files && this.files.length)
            fileName = (this.getAttribute('data-multiple-caption') || '').replace('{count}', this.files.length);
          else
            fileName = e.target.value.split('\\').pop();

          if (fileName)
            label.querySelector('ul').innerHTML = ('<li>' + fileName + '</li>');
          else
            label.innerHTML = labelVal;
        }
      });

      // Firefox bug fix
      input.addEventListener('focus', function () {
        input.classList.add('has-focus');
      });
      input.addEventListener('blur', function () {
        input.classList.remove('has-focus');
      });
    });
  }(document, window, 0));
}

function initTelegramForms() {
  jQuery('#main-form-submit').on('click', function(e) {
    e.preventDefault();
    // initformValidation();
    var errors = jQuery('#form-main .has-error');
    if (errors.length) {
      return false;
    }
    var form_data = jQuery('#form-main').serialize();
    jQuery.ajax({ //telegram to admins
      type: "POST",
      url: "telegram.php",
      data: form_data,
      success: function() {
        jQuery('.thank-massage').addClass('done');
        setTimeout(function() { jQuery('.thank-massage').removeClass('done'); }, 3000);
      },
    });
    return false;
  })
}
