'use strict'

angular.module 'elektorApp'
.controller 'ClientResultCtrl', ( $scope, Poll, Auth, $state ) ->

  Auth.me (user) ->
    if user.role isnt "member"
      $state.go "login"
    else
      $scope.user = user
#      $scope.polls = Poll.published_polls branch: user._member._branch._id

      Poll.published_polls branch: user._member._branch._id, (result) ->
        $scope.polls = result
        if result.length is 0
          $scope.noPoll = true

      $scope.showResults = (p) ->
        if p.published then $state.go "result_details", id: p._id
