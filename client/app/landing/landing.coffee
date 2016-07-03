'use strict'

angular.module 'elektorApp'
.config ($stateProvider) ->
  $stateProvider.state 'landing',
    url: '/'
    templateUrl: 'app/landing/landing.html'
    controller: 'LandingCtrl'
    guestView: true
