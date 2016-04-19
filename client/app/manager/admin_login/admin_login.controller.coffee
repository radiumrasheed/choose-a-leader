'use strict'

angular.module 'elektorApp'
.controller 'AdminLoginCtrl', ($scope ,$auth, $window, toastr, $state) ->
  $scope.login = ->
    $auth.login
      username: $scope.username
      password: $scope.password
      admin: true
    .then ->
      toastr.success 'Login Successful!'
      $window.location.href = $state.get('admin_dashboard').url
    , (e) ->
      toastr.error e.data.message