'use strict';

// Declare app level module which depends on filters, and services
angular.module('leftnavApp', [
    'ngAnimate',
    'ngTouch',
    'ngRoute',
    'leftnavApp.controllers',
    'leftnavApp.directives'
])
.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {templateUrl: 'partials/index.html', controller: 'indexController', activeName:'Home'});
    $routeProvider.when('/trips', {templateUrl: 'partials/generic.html', controller: 'tripsController', activeName:'Trips'});
    $routeProvider.when('/guide', {templateUrl: 'partials/index.html', controller: 'guideController', activeName:'Guide'});
    $routeProvider.when('/flights', {templateUrl: 'partials/generic.html', controller: 'flightsController', activeName:'Flights'});
    $routeProvider.when('/hotels', {templateUrl: 'partials/generic.html', controller: 'hotelsController', activeName:'Hotels'});
    $routeProvider.when('/circles', {templateUrl: 'partials/index.html', controller: 'circleController', activeName:'From your circles'});
    $routeProvider.otherwise({redirectTo: '/'});

}])
.run(['$rootScope', function($rootScope) {
    $rootScope.showNav = false;
    $rootScope.hideNav = function() {
        $rootScope.showNav = false;
    };
    $rootScope.displayNav = function() {
        $rootScope.showNav = true;
    };
}]);