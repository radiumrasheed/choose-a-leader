'use strict'

angular.module 'elektorApp'
.config ($stateProvider) ->
  $stateProvider.state 'ballots',
    url: '/ballots/:id/'
    templateUrl: 'app/ballots/ballots.html'
    controller: 'BallotsCtrl'
