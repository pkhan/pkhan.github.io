$(document).ready(function() {
    // Fix for IE8 Image Cover duplication
    if(!Modernizr.testProp('backgroundSize')) {
        var styleString = '';
        $('.image-brick').css({
            background: 'none'
        });
    }

    $('a[href^=#]').on('click', function(evt) { 
        evt.preventDefault();
        var $anchor = $(this);
        var $dest = $($(this).attr('href'));
        $('html,body').animate({
            scrollTop: $dest.offset().top
        }, 300);
    });
});