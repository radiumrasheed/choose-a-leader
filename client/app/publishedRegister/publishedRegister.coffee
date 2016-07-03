'use strict'

angular.module 'elektorApp'
.config ($stateProvider) ->
  $stateProvider.state 'published_register',
    url: '/published_register'
    guestView: true
    templateUrl: 'app/publishedRegister/publishedRegister.html'
    controller: 'PublishedRegisterCtrl'
