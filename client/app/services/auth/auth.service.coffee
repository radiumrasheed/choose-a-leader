'use strict'

angular.module 'elektorApp'
.service 'Auth', ($resource) ->
  # AngularJS will instantiate a singleton by calling 'new' on this function
  $resource '/auth/:id', null,
    retrievePassword:
      method:'POST'
      url: '/auth/requestPassword'
    changePassword:
      method:'POST'
      url: '/auth/changePassword'
    update: method:'PUT'
    me:
      method: 'GET'
      url: '/auth/me'
    resendCode:
      method: 'GET'
      url: '/auth/sendCode'
    confirmCode:
      method: 'POST'
      url: '/auth/confirmCode'