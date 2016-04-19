'use strict'

angular.module 'elektorApp'
.config ($stateProvider) ->
  $stateProvider.state 'admin_login',
    url: '/admin_login/'
    guestView: true
    templateUrl: 'app/manager/admin_login/admin_login.html'
    controller: 'AdminLoginCtrl'
