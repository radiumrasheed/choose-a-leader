'use strict'

angular.module 'elektorApp'
.controller 'VideoCtrl', ($scope,$state) ->
  $scope.url = 'https://www.youtube.com/watch?v=UikEVO8uQMw&authuser=0'
  $scope.$on 'youtube.player.ready', ($event, player) ->
    player.setPlaybackQuality('large')
  $scope.goBack = ->
    $state.go 'landing'
  $scope.playerVars = {
    controls: 1,
    rel: 0
  };
