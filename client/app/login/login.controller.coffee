'use strict'

angular.module 'elektorApp'
.controller 'LoginCtrl', ($scope, $auth, $window, toastr, Auth, $rootScope, $state) ->
  $scope.login = ->
    $scope.formError = null
    $scope.submitting = true

    $auth.login
      username: $scope.username
      password: $scope.password
    .then (r) ->
      Auth.me (user) ->
        $rootScope.$user = user

        toastr.success 'Login Successful!'
        if r.headers "changed_password" isnt "true" then $window.location.href = "/change_password"
#        else if r.body.role "Admin"
        else $window.location.href = '/dashboard'

    , (e) ->
      $scope.submitting = false
      toastr.error e.data.message
      $scope.formError = e.data.message

  $scope.adminLogin = ->
    $state.go 'admin_login'
