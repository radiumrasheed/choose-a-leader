'use strict'

angular.module 'elektorApp'
.controller 'ResetPasswordCtrl', ( Auth, $scope, toastr, $stateParams, $state) ->

  Auth.resetPassword id: $stateParams.resetToken, (doc) ->
    if doc.message
      $scope.expired = true
      $scope.expiredMessage = doc.message
    else
      $scope.ready = true
      $scope.u = doc
  , (e) ->
    $state.go 'forgot_password'
    toastr.error e.data.message

  $scope.newPassword = (theForm) ->
    if theForm.$valid
      $scope.submitting = true
      $scope.formError = null
      $scope.formSuccess = null

      Auth.newPassword $scope.u, (response) ->
        $scope.submitting = false
        toastr.success response.message

        $scope.password_cnf = null
        theForm.$setPristine()
        $state.go 'login'

      , (e) ->
        $scope.submitting = false
        $scope.formError = e.data.message
        toastr.error e.data.message
    else
      $scope.formError = "All fields are required"

