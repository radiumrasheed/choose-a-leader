'use strict'

angular.module 'elektorApp'
.config ($stateProvider) ->
  $stateProvider.state 'candidates',
  url: '/candidates'
  templateUrl: 'app/candidates/candidates.html'
  controller: 'CandidatesCtrl'
  guestView: true
    