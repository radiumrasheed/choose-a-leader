'use strict'

angular.module 'elektorApp'
.controller 'ResetPasswordCtrl', ( Auth, $scope, toastr, $stateParams) ->

  console.log $stateParams.resetToken
  Auth.resetPassword id: $stateParams.resetToken, ->
    alert $stateParams.resetToken
