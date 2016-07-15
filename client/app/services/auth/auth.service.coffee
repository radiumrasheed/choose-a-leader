'use strict'

angular.module 'elektorApp'
.service 'Auth', ($resource) ->
  # AngularJS will instantiate a singleton by calling 'new' on this function
  $resource '/auth/:id', null,
    resetRequest:
      method:'POST'
      url: '/auth/resetRequest'
    verifyResetRequest:
      method: 'POST'
      url: '/auth/verifyResetRequest'
    changePassword:
      method:'POST'
      url: '/auth/changePassword'
    newPassword:
      method: 'POST'
      url: '/auth/newPassword'
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
    sendOTP:
      method: 'GET'
      url: '/auth/sendOTP'
    resetPassword:
      method: 'POST'
      url: '/auth/resetPassword'