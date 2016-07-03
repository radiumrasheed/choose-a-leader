'use strict'

angular.module 'elektorApp'
.config ($stateProvider) ->
  $stateProvider.state 'forgot_password',
    url: '/forgot_password'
    guestView: true
    templateUrl: 'app/forgot_password/forgot_password.html'
    controller: 'ForgotPasswordCtrl'
