'use strict'

angular.module 'elektorApp'
.config ($stateProvider) ->
  $stateProvider.state 'youtube',
    url: '/youtube'
    templateUrl: 'app/videoPage/youtube.html'
    controller: 'VideoCtrl'
    guestView: true
