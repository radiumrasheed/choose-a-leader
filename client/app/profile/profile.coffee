'use strict'

angular.module 'elektorApp'
.config ($stateProvider) ->
  $stateProvider.state 'profile',
    url: '/profile'
    templateUrl: 'app/profile/profile.html'
    controller: 'ProfileCtrl'
