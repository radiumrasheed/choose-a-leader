'use strict'

angular.module 'elektorApp'
.config ($stateProvider) ->
  $stateProvider.state 'help',
    url: '/help'
    templateUrl: 'app/help/help.html'
    controller: 'HelpCtrl'
    guestView: true
