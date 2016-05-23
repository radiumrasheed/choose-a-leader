'use strict'

angular.module 'elektorApp'
.config ($stateProvider) ->
  $stateProvider.state 'pre_setup',
    url: '/pre_setup/:id/'
    guestView: true
    templateUrl: 'app/pre_setup/pre_setup.html'
    controller: 'PreSetupCtrl'

