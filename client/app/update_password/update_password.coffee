'use strict'

angular.module 'elektorApp'
.config ($stateProvider) ->
  $stateProvider.state 'update_password',
    url: '/update_password'
    templateUrl: 'app/update_password/update_password.html'
    controller: 'UpdatePasswordCtrl'
