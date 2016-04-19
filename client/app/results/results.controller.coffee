'use strict'

angular.module 'elektorApp'
.controller 'ClientResultCtrl', ( $scope, Poll, Auth, $state ) ->
  
  Auth.me (user) ->
    $scope.user = user
    $scope.polls = Poll.published_polls branch: user._member._branch._id

    $scope.showResults = (p) ->
      if p.published then $state.go "result_details", id: p._id