'use strict'

angular.module 'elektorApp'
.controller 'ClientPollsCtrl', ($scope, $state, Poll, Auth, $auth, $sessionStorage) ->

  $scope.polls = []

  Auth.me (user) ->
    if user.role isnt "member"
      $state.go "login"
    else
      $scope.user = user

      if typeof user._member._branch is undefined or user._member._branch is null
        $auth.logout()
        $sessionStorage.tempMember = user._member
        $state.go "branch_request", id: user._member._id

      Poll.my_polls branch: user._member._branch._id, (polls) ->
        $scope.ready = true
        $scope.polls = polls

      $scope.open = (p) ->
        moment().isAfter(p.opens) and moment().isBefore(p.closes)

      $scope.yetToOpen = (p) ->
        moment().isBefore(p.opens) and moment().isBefore(p.closes)

      $scope.before = (dt) ->
        moment().isBefore(dt)

      $scope.after = (dt) ->
        moment().isAfter(dt)

      $scope.showBallot = (p) ->
#        if $scope.open p then
        $state.go "ballots", id: p._id
