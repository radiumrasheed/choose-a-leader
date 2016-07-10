'use strict'

angular.module 'elektorApp'
.config ($stateProvider) ->
  $stateProvider.state 'reset_password',
    url: '/reset_password/:resetToken'
    templateUrl: 'app/reset_password/reset_password.html'
    controller: 'UpdatePasswordCtrl'
    guestView: true
