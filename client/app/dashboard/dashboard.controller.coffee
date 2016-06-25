'use strict'

angular.module 'elektorApp'
.controller 'DashboardCtrl', ($scope, $rootScope, Auth, Utils, $state, Poll) ->
  Auth.me (user) ->
    if user.role isnt "member"
      $state.go "login"
    else
      $scope.user = user
      $scope.polls = []
      Utils.userIsSetup user

      $scope.open = (p) ->
        moment().isAfter(p.opens) and moment().isBefore(p.closes)

      $scope.after = (dt) ->
        moment().isAfter(dt)

      Poll.my_polls branch: user._member._branch._id, (polls) ->
        $scope.polls = polls

      $rootScope.$on "pollSettings", (e, data) ->
        $scope.starts = _.find data, (d) -> d.name is "poll_starts"
        $scope.ends = _.find data, (d) -> d.name is "poll_ends"

      $scope.showBallot = (p) ->
#        if $scope.open p then 
        $state.go "ballots", id: p._id
