'use strict'

angular.module 'elektorApp'
.controller 'NavbarCtrl', ($scope, $location, $auth, $state, $rootScope, $timeout, Setting) ->
  $scope.headBoard = ->
    Setting.query {}, (settings) ->
      $scope.settings = _.filter settings, (s) ->
        s.name is "poll_starts" or s.name is "poll_ends"
      $rootScope.$broadcast "pollSettings", settings

      publish = _.find settings, (d) -> d.name is "publish_results"
      $rootScope.showResults = if publish?.value then publish.value is "1" else false

      $timeout ->
        $scope.headBoard()
      , 120000
    return

  $scope.headBoard()

  $scope.logout = ->
    if confirm 'Are you sure?'
      $auth.logout()
      $state.go 'login'

  $scope.isGuest = ->
    !$auth.isAuthenticated()

  $scope.notAdmin = ->
    $rootScope.$user.role isnt 'admin'

  $scope.isCollapsed = true

  $scope.isActive = (route) ->
    $location.path().indexOf route is 0
