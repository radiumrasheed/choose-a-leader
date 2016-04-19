'use strict'

angular.module 'elektorApp'
.controller 'UnconfirmedCtrl', ($scope, $auth) ->
  $auth.logout()
