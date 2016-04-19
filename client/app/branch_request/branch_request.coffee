'use strict'

angular.module 'elektorApp'
.config ($stateProvider) ->
  $stateProvider.state 'branch_request',
    guestView: true
    url: '/branch_request/:id/'
    templateUrl: 'app/branch_request/branch_request.html'
    controller: 'BranchRequestCtrl'
