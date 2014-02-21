'use strict';

/* Directives */

angular.module('galleryApp.directives', []).
    directive('gallery', function() {
        return {
            restrict: 'A',
            controller: ['$scope', '$element', function($scope, $el) {
                $scope.images = [
                    {
                        src: 'img/mvcube.jpg',
                        desc: 'Google Cube',
                        id: 0,
                        active: false
                    },
                    {
                        src: 'img/mvfood.jpg',
                        desc: 'Sandwich Bar',
                        id: 1,
                        active: false
                    },
                    {
                        src: 'img/nymk.jpg',
                        desc: 'Google NYC Micro-kitchen',
                        id: 2,
                        active: false
                    },
                    {
                        src: 'img/flower.jpg',
                        desc: 'A flower',
                        id: 3,
                        active: false
                    },
                    {
                        src: 'img/path.jpg',
                        desc: 'A path',
                        id: 4,
                        active: false
                    },
                    {
                        src: 'img/doglawn.jpg',
                        desc: 'A dog on a lawn',
                        id: 5,
                        active: false
                    }
                ];
                this.setActive = function(image) {
                    var i = 0, len = $scope.images.length;
                    for (; i < len; i++) {
                        $scope.images[i].active = false;
                    }
                    if (image) {
                        image.active = true;
                        $scope.index = image.id;
                    }
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
                images: '=',
                detailClosed: '='
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
    .directive('imagesDetail', ['$animate', function($animate) {
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
                scope.cachedImages = [
                    scope.images[scope.count - 1],
                    scope.images[0],
                    scope.images[1]
                ];
                var nextImage = angular.element(el[0].querySelector('.next-image'));
                var priorImage = angular.element(el[0].querySelector('.prior-image'));
                var activeImage = angular.element(el[0].querySelector('.active-image'));
                var tempImage;
                scope.hide = function() {
                    scope.detailClosed = true;
                };
                scope.$watch('images', function(newValue, oldValue) {
                    scope.count = newValue.length;
                });
                scope.$watch('detailClosed', function() {
                    scope.cachedImages = [
                        scope.images[bounder(scope.index - 1, 0, scope.count - 1)],
                        scope.images[scope.index],
                        scope.images[bounder(scope.index + 1, 0, scope.count - 1)]
                    ];
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
                    var index = bounder(scope.index + 1, 0, scope.count - 1);
                    scope.nextImage = scope.images[index];
                    removeClasses();
                    $animate.addClass(nextImage, 'slide-next', function() {
                        scope.index = index;
                        scope.$digest()
                    });
                    $animate.addClass(activeImage, 'slide-out-left')
                };
                scope.prior = function() {
                    var index = bounder(scope.index - 1, 0, scope.count - 1);
                    scope.priorImage = scope.images[index];
                    removeClasses();
                    $animate.addClass(priorImage, 'slide-prior', function() {
                        scope.index = index;
                        scope.$digest();
                    });
                    $animate.addClass(activeImage, 'slide-out-right')
                }
                scope.toggleControls = function() {
                    scope.showControls = !scope.showControls;
                }
            },
            templateUrl: 'partials/images-detail.html'
        }
    }]);
