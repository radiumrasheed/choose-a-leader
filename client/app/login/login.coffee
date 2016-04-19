'use strict'

angular.module 'elektorApp'
.config ($stateProvider) ->
  $stateProvider.state 'login',
    url: '/login/'
    guestView: true
    templateUrl: 'app/login/login.html'
    controller: 'LoginCtrl'
