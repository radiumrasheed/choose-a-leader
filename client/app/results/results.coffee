'use strict'

angular.module 'elektorApp'
.config ($stateProvider) ->
  $stateProvider.state 'results',
    url: '/results/'
    templateUrl: 'app/results/results.html'
    controller: 'ClientResultCtrl'
