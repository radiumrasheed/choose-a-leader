'use strict'

angular.module 'elektorApp'
.config ($stateProvider) ->
  $stateProvider.state 'request_password',
    url: '/request_password'
    guestView: true
    templateUrl: 'app/request_password/request_password.html'
    controller: 'RequestPasswordCtrl'
