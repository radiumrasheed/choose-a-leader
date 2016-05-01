'use strict'

angular.module 'elektorApp'
.controller 'DashboardCtrl', ($scope, $rootScope, Auth, Utils, Setting, $state) ->
  Auth.me (response) ->
    if response.role isnt "member"
      $state.go "login"
    else
      $rootScope.$on "pollSettings", (e, data) ->
        $scope.starts = _.find data, (d) -> d.name is "poll_starts"
        $scope.ends = _.find data, (d) -> d.name is "poll_ends"

      Setting.memberStats {}, (d) ->
        $scope.verified = _.find d[0], (i) -> i._id is 1
        $scope.unVerified = _.find d[0], (i) -> i._id is 0

        $scope.total = $scope.verified.count + $scope.unVerified.count

        $scope.accredited = _.find d[1], (i) -> i._id

      Auth.me (user) ->
        $scope.user = user
        Utils.userIsSetup user
