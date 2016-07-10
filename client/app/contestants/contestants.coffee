'use strict'

angular.module 'elektorApp'
.config ($stateProvider) ->
  $stateProvider.state 'contestants',
  url: '/contestants'
  templateUrl: 'app/contestants/contestants.html'
  controller: 'ContestantsCtrl'
  guestView: true
