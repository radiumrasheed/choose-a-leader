'use strict'

angular.module 'elektorApp'
.config ($stateProvider) ->
  $stateProvider.state 'change_password',
    url: '/change_password'
    templateUrl: 'app/change_password/change_password.html'
    controller: 'ChangePasswordCtrl'
