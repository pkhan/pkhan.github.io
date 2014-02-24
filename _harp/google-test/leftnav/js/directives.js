'use strict';

/* Directives */

angular.module('leftnavApp.directives', ['ngRoute'])
    .directive('leftNav', function() {
        return {
            restrict: 'A',
            controller: ['$scope', '$route', function($scope, $route) {
                $scope.activeIndex = 0;
                $scope.items = [
                    {
                        name: 'Home',
                        href: '#/',
                        icon: 'glyphicon-home',
                        active: true
                    },
                    {
                        name: 'Trips',
                        href: '#/trips',
                        icon: 'glyphicon-briefcase',
                        active: false
                    },
                    {
                        name: 'Guide',
                        href: '#/guide',
                        icon: 'glyphicon-book',
                        active: false
                    },
                    {
                        name: 'Flights',
                        href: '#/flights',
                        icon: 'glyphicon-plane',
                        active: false
                    },
                    {
                        name: 'Hotels',
                        href: '#/hotels',
                        icon: 'glyphicon-calendar',
                        active: false
                    },
                    {
                        name: 'From your circles',
                        href: '#/circles',
                        icon: 'glyphicon-record',
                        active: false
                    },
                ];
                $scope.route = $route;
                $scope.$watch('route.current', function() {
                    var newName = $route.current.activeName;
                    var i = 0, len = $scope.items.length, item;
                    for(; i < len; i++) {
                        item = $scope.items[i];
                        if (item.name === newName) {
                            item.active = true;
                        } else {
                            item.active = false;
                        }
                    }
                });
            }],
            templateUrl: 'partials/left-nav.html',
            relpace: true
        };
    })
    .directive('toggleNav', function() {
        return {
            restrict: 'A',
            scope: {
                'headerName': '='
            },
            templateUrl: 'partials/toggle-nav.html',
            controller: ['$scope', '$rootScope', function($scope, $rootScope) {
                $scope.toggleNav = function () {
                    $rootScope.showNav = ! $rootScope.showNav;
                };
            }]
        };
    })
    .directive('stopEvent', function() {
        return {
            restrict: 'A',
            link: function(scope, elem, attrs) {
                var events = attrs.stopEvent.split(' ');
                var stopHandler = function(e) {
                    e.stopPropagation();
                };
                var i = 0, len = events.length;
                for(; i < len; i++) {
                    elem.bind(events[i], stopHandler);
                }
            }
        };
    })
    .directive('navItem', function() {
        return {
            restrict: 'E',
            scope: {
                item: '='
            },
            templateUrl: 'partials/nav-item.html',
            replace: true
        };
    });