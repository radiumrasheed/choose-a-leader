'use strict'

angular.module 'elektorApp'
.controller 'ChangePasswordCtrl', ( $scope, Auth, toastr, $state ) ->

  Auth.me (user) ->
    $scope.u = user

    $scope.changePassword = ->
      $scope.submitting = true
      $scope.formError = null
      $scope.formSuccess = null

      Auth.changePassword $scope.u, (response) ->
        $scope.submitting = false
        toastr.success response.message

        $state.go "setup_account"
      , (e) ->
        $scope.submitting = false
        $scope.formError = e.data.message
        toastr.error e.data.message
