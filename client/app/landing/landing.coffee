'use strict'

angular.module 'elektorApp'
.config ($stateProvider) ->
  $stateProvider.state 'landing',
    url: '/landing'
    templateUrl: 'app/landing/landing.html'
    controller: 'LandingCtrl'
    guestView: true