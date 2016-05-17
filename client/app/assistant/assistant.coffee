'use strict'

angular.module 'elektorApp'
.config ($stateProvider) ->
  $stateProvider.state 'assistant',
    url: '/assistant/'
    guestView: true
    templateUrl: 'app/assistant/assistant.html'
    controller: 'AssistantCtrl'