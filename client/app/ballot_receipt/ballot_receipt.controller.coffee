'use strict'

angular.module 'elektorApp'
.controller 'BallotReceiptCtrl', ($scope, Vote) ->
  $scope.submit = ->
    Vote.receipt code: $scope.code, (rec) ->
      $scope.votes = rec