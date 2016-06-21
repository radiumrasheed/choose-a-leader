'use strict'

angular.module 'elektorApp'
.controller 'AssistantCtrl', ($scope, $auth, $window, toastr, Auth, $state) ->
  Auth.me (user) ->
    if user.role isnt "member"
      $state.go "login"
