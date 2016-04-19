'use strict'

angular.module 'elektorApp'
.config ($stateProvider) ->
  $stateProvider.state 'result_details',
    url: '/result_details/:id/'
    templateUrl: 'app/result_details/result_details.html'
    controller: 'ResultDetailsCtrl'
