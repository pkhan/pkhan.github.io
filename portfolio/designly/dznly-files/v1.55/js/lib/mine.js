  window.slideToggles = function(){
    $('.slide-controls-wrapper .controls button').tooltip({
      toggle: 'tooltip',
      delay: { show: 0, hide: 50 },
      placement: 'right'
    })
  };

$(function() { 


  // EDITOR TOOLTIPS
  $('.top-controls-container .controls button').tooltip({
    toggle: 'tooltip',
    delay: { show: 200, hide: 0 },
    placement: 'bottom'
  });

  $('.brick-bar button').tooltip({
    toggle: 'tooltip',
    delay: { show: 200, hide: 0 },
    placement: 'bottom',
    container: '.brick-bar'
  });

  window.slideToggles();

  // BOOTSTRAP DROPDOWN BUTTON
  $('.dropdown-toggle').dropdown();


  // SET FONT PICKER FONTS
  $('li.font').find('a').each(function(){
    $(this).css('font-family',$(this).attr('data-value'));
  });

}); 