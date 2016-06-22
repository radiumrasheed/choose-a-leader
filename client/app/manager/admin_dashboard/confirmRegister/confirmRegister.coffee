'use strict'

angular.module 'elektorApp'
.config ($stateProvider) ->
  $stateProvider.state 'confirm_register',
    url: '/confirmregister'
    guestView: false
    templateUrl: 'app/manager/admin_dashboard/confirmRegister/confirmRegister.html'
    controller: 'ConfirmRegisterCtrl'
