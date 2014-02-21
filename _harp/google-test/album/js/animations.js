angular.module('galleryApp.animations', ['ngAnimate'])
    .animation('.grid-image', function(){
        return {
            addClass: function(element, className, done) {
                if (className === 'expand') {
                    var wrapper = angular.element('<div class="center expand-wrapper"></div>');
                    var offset = element.offset();
                    wrapper.css({
                        top: offset.top - window.scrollY,
                        left: offset.left,
                        height: element.height(),
                        width: element.width()
                    });
                    element.wrap(wrapper);
                    wrapper = element.parent();
                    wrapper.prepend('<span class="vertical-assist">');
                    wrapper.animate({
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%'
                    }, 500, function() {
                        window.setTimeout(function() {
                            wrapper.find('span').remove();
                            element.unwrap();
                            done();
                        }, 200);
                    });
                }
            }
        };
    });