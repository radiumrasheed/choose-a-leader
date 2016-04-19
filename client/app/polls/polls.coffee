'use strict'

angular.module 'elektorApp'
.config ($stateProvider) ->
  $stateProvider.state 'polls',
    url: '/polls/'
    templateUrl: 'app/polls/polls.html'
    controller: 'ClientPollsCtrl'
