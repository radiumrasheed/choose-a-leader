'use strict'

angular.module 'elektorApp'
.config ($stateProvider) ->
  $stateProvider.state 'voters_register',
    url: '/voters_registerss'
    guestView: true
    templateUrl: 'app/voters_register/voters_register.html'
    controller: 'RegisterCtrl'
