'use strict'

angular.module 'elektorApp'
.config ($stateProvider) ->
  $stateProvider.state 'setup_account',
    url: '/setup/'
    templateUrl: 'app/setup_account/setup_account.html'
    controller: 'SetupAccountCtrl'
