'use strict'

angular.module 'elektorApp'
.config ($stateProvider) ->
  $stateProvider.state 'election_result',
    url: '/election_result'
    templateUrl: 'app/election_result/election_result.html'
    controller: 'ElectionResultCtrl'
    guestView: true
