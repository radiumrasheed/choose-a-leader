'use strict'

angular.module 'elektorApp'
.controller 'UpdatePasswordCtrl', ( $scope, Auth, toastr ) ->

  Auth.me (user) ->
    $scope.u = angular.copy user

    #TODO: Validate Current Password
    $scope.changePassword = (theForm) ->
      if theForm.$valid
        $scope.submitting = true
        $scope.formError = null
        $scope.formSuccess = null

        Auth.changePassword $scope.u, (response) ->
          $scope.submitting = false
          toastr.success response.message

          $scope.u = angular.copy user
          $scope.password_cnf = null
          theForm.$setPristine()

        , (e) ->
          $scope.submitting = false
          $scope.formError = e.data.message
          toastr.error e.data.message
      else
        $scope.formError = "All fields are required"