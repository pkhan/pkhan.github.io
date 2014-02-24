'use strict';

/* Controllers */

angular.module('leftnavApp.controllers', []).
    controller('indexController', ['$scope', function($scope) {
        $scope.headerName = 'Home';
        $scope.destinations = [
            {
                city: 'San Francisco',
                range: 'May 4-8',
                image: 'img/sf.jpg'
            },
            {
                city: 'New York City',
                range: 'April 13-19',
                image: 'img/nyc.jpg'
            },
            {
                city: 'Los Angeles',
                range: 'July 4-11',
                image: 'img/la.jpg'
            }
        ]
    }])
    .controller('tripsController', ['$scope', function($scope) {
        $scope.items = [
            {
                title: 'Virgin VX 789',
                sub: 'SFO > ORD',
                date: '11:55am - Fri, May 4',
                image: 'img/virgin.png'
            },
            {
                title: 'Virgin VX 789',
                sub: 'ORD > SFO',
                date: '2:25pm - Tue, May 8',
                image: 'img/virgin.png'
            },
            {
                title: 'Hotel Sax, Chicago',
                date: '3:00pm - Friday, May 4',
                image: 'img/sax.jpg'
            }

        ];
        $scope.headerName = 'Trips'
    }])
    .controller('flightsController', ['$scope', function($scope) {
        $scope.items = [
            {
                title: 'Virgin VX 789',
                sub: 'SFO > ORD',
                date: '11:55am - Fri, May 4',
                image: 'img/virgin.png'
            },
            {
                title: 'Virgin VX 789',
                sub: 'ORD > SFO',
                date: '2:25pm - Tue, May 8',
                image: 'img/virgin.png'
            },
            {
                title: 'American AA 120',
                sub: 'NYC > PIT',
                date: '10:00am - Friday, June 3',
                image: 'img/aa.jpg'
            },
            {
                title: 'Southwest S 4',
                sub: 'IAD > SFO',
                date: '10:15am - Tuesday, July 10',
                image: 'img/sw.jpg'
            }

        ];
        $scope.headerName = 'Flights'
    }])
    .controller('hotelsController', ['$scope', function($scope) {
        $scope.items = [
            {
                title: 'Hotel Sax, Chicago',
                date: '3:00pm - Friday, May 4',
                image: 'img/sax.jpg'
            },
            {
                title: 'Hotel Sax, Chicago',
                date: '3:00pm - Friday, May 11',
                image: 'img/sax.jpg'
            },
            {
                title: 'Hotel Sax, Chicago',
                date: '3:00pm - Friday, May 18',
                image: 'img/sax.jpg'
            },
            {
                title: 'Omni William Penn, Pittsburgh',
                date: '3:00pm - Friday, May 25',
                image: 'img/omnipit.jpg'
            },

        ];
        $scope.headerName = 'Hotels'
    }])
    .controller('guideController', ['$scope', function($scope) {
        $scope.headerName = 'Guide';
        $scope.destinations = [
            {
                city: 'San Francisco',
                range: 'May 4-8',
                image: 'img/sf.jpg'
            },
            {
                city: 'New York City',
                range: 'April 13-19',
                image: 'img/nyc.jpg'
            },
            {
                city: 'Los Angeles',
                range: 'July 4-11',
                image: 'img/la.jpg'
            }
        ]
    }])
    .controller('circleController', ['$scope', function($scope) {
        $scope.headerName = 'From your circles';
        $scope.destinations = [
            {
                city: 'San Francisco',
                range: 'May 4-8',
                image: 'img/sf.jpg'
            },
            {
                city: 'New York City',
                range: 'April 13-19',
                image: 'img/nyc.jpg'
            },
            {
                city: 'Los Angeles',
                range: 'July 4-11',
                image: 'img/la.jpg'
            }
        ]
    }])
    ;