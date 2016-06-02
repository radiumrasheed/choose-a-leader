'use strict'

angular.module 'elektorApp'
.service 'Voters_Register', ($resource) ->
  # AngularJS will instantiate a singleton by calling 'new' on this function
  $resource "/api/votersReg/:id", null,
    branches:
      method: 'POST'
      isArray: true
      url: '/api/votersReg'
    branchDetails:
      method: 'POST'
      isArray: true
      url: '/api/votersReg/details'
    me:
      url: '/api/votersReg/me'
      method: 'GET'
    saveData:
      method: 'POST'
      url: '/api/votersReg/save'
