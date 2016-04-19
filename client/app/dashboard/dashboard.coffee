'use strict'

angular.module 'elektorApp'
.config ($stateProvider) ->
  $stateProvider.state 'dashboard',
    url: '/'
    templateUrl: 'app/dashboard/dashboard.html'
    controller: 'DashboardCtrl'
