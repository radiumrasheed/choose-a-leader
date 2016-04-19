'use strict'

angular.module 'elektorApp'
.controller 'LoginCtrl', ($scope, $auth, $window, toastr, Auth, $rootScope) ->
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
        else $window.location.href = '/'
    , (e) ->
      $scope.submitting = false
      toastr.error e.data.message
      $scope.formError = e.data.message