'use strict'

angular.module 'elektorApp'
.controller 'BallotReceiptCtrl', ($scope, Vote, Auth, $state) ->
  Auth.me (response) ->
    $scope.ready = true
    if response.role isnt "member"
      $state.go "login"
    else
      $scope.submit = ->
        Vote.receipt (rec) ->
          $scope.receipts = rec
