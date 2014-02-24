'use strict';

/* Directives */

angular.module('galleryApp.directives', [])
    .directive('gallery', function() {
        return {
            restrict: 'A',
            controller: ['$scope', '$element', function($scope, $el) {
                $scope.images = [
                    {
                        src: 'img/mvcube.jpg',
                        desc: 'Google Cube',
                        index: 0
                    },
                    {
                        src: 'img/mvfood.jpg',
                        desc: 'Sandwich Bar',
                        index: 1
                    },
                    {
                        src: 'img/nymk.jpg',
                        desc: 'Google NYC Micro-kitchen',
                        index: 2
                    },
                    {
                        src: 'img/flower.jpg',
                        desc: 'A flower',
                        index: 3
                    },
                    {
                        src: 'img/path.jpg',
                        desc: 'A path',
                        index: 4
                    },
                    {
                        src: 'img/doglawn.jpg',
                        desc: 'A dog on a lawn',
                        index: 5
                    }
                ];
                this.setActive = function(image) {
                    $scope.index = image.index;
                };
                $scope.index = 0;
                $scope.detailClosed = true;
                this.openDetail = function() {
                    $scope.detailClosed = false;
                };
            }],
            templateUrl: 'partials/gallery.html'
        }
    })
    .directive('grid', ['$animate', function($animate) {
        return {
            restrict: 'A',
            require: '^gallery',
            scope : {
                images: '='
            },
            link: function(scope, el, attrs, galleryController) {
                scope.showImage = function(image, evt) {
                    var target = angular.element(evt.target);
                    galleryController.setActive(image);
                    $animate.addClass(target, 'expand', function() {
                        target.removeClass('expand');
                    });
                    galleryController.openDetail();
                };
            },
            templateUrl: 'partials/grid.html'
        }
    }])
    .directive('imagesDetail', ['$animate', '$swipe', function($animate, $swipe) {
        return {
            restrict: 'A',
            require: '^gallery',
            scope: {
                detailClosed: '=',
                images: '=',
                index: '='
            },
            link: function(scope, el, attrs, galleryController) {
                scope.showControls = true;
                scope.count = 0;
                scope.imageCache = [
                    scope.images[scope.count - 1],
                    scope.images[0],
                    scope.images[1]
                ];
                var tempImage;
                scope.hide = function() {
                    scope.detailClosed = true;
                };
                scope.$watch('images', function(newValue, oldValue) {
                    scope.count = newValue.length;
                });
                scope.$watch('detailClosed', function(newValue, oldValue) {
                    if(newValue = true) {
                        angular.copy([
                            scope.images[bounder(scope.index - 1, 0, scope.count - 1)],
                            scope.images[scope.index],
                            scope.images[bounder(scope.index + 1, 0, scope.count - 1)]
                        ], scope.imageCache);
                    }
                });
                scope.image = scope.images[scope.index];
                scope.count = scope.images.length;
                var bounder = function(index, min, max) {
                    if (index < min) {
                        return max;
                    }
                    if (index > max) {
                        return min;
                    }
                    return index;
                };
                scope.next = function() {
                    scope.index = bounder(scope.index + 1, 0, scope.count - 1);
                    var nextIndex = bounder(scope.index + 1, 0, scope.count - 1);
                    var nextImage = scope.images[nextIndex];
                    scope.imageCache.shift();
                    scope.imageCache.push(nextImage);

                };
                scope.prior = function() {
                    scope.index = bounder(scope.index - 1, 0, scope.count - 1);
                    var priorIndex = bounder(scope.index - 1, 0, scope.count - 1);
                    var priorImage = scope.images[priorIndex];
                    scope.imageCache.pop();
                    scope.imageCache.unshift(priorImage);
                };
                scope.toggleControls = function() {
                    scope.showControls = !scope.showControls;
                };

                //swipe binding

                var inner = el.find('.images-inner');
                var startX;
                var threshold = 100; //px after which swipe goes

                var swipeStart = function(pos) {
                    startX = pos.x;
                };

                var swipeMove = function(pos) {
                    inner.css({
                        'margin-left' : pos.x - startX
                    });
                };

                var swipeEnd = function(pos) {
                    var delta = startX - pos.x;
                    if (Math.abs(delta) > threshold) {
                        if (delta < 0) {
                            scope.prior();
                        } else {
                            scope.next();
                        }
                    }
                    scope.$apply();
                    window.setTimeout(function() {
                        inner.animate({
                            'margin-left': 0
                        }, 120);
                    }, 100);
                };

                $swipe.bind(inner, {
                    start: swipeStart,
                    move: swipeMove,
                    end: swipeEnd,
                    cancel: swipeEnd
                });
            },
            templateUrl: 'partials/images-detail.html'
        }
    }]);
