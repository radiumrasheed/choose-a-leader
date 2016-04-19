'use strict'

angular.module 'elektorApp'
.config ($stateProvider) ->
  $stateProvider.state 'unconfirmed',
    url: '/unconfirmed'
    guestView: true
    templateUrl: 'app/unconfirmed/unconfirmed.html'
    controller: 'UnconfirmedCtrl'