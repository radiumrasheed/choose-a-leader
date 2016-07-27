'use strict'

angular.module 'elektorApp'
.service 'VotersRegister', ($resource) ->
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
    searchDetails:
      method: 'POST'
      isArray: true
      url: '/api/votersReg/search'
    me:
      url: '/api/votersReg/me'
      method: 'GET'
    saveData:
      method: 'POST'
      url: '/api/votersReg/save'
    saveData2:
      method: 'POST'
      url: '/api/votersReg/save2'
    getCount:
      method: 'GET'
      url: '/api/votersReg/getCount'
    getUpdate:
      method: 'GET'
      url: '/api/votersReg/getUpdate'
    create:
      method: 'POST'
      url: '/api/votersReg/create'
    branchMembers:
      method: 'POST'
      isArray: true
      url: '/api/votersReg/branchMembers'
    checkVotersName:
      method: 'POST'
      isArray: true
      url: '/api/votersReg/checkVotersName'
    removeVoters:
      method: 'POST'
      isArray: true
      url: '/api/votersReg/removeVoters'
    getConfirmed:
      method: 'POST'
      isArray: true
      url: '/api/votersReg/getConfirmed'
    getSpecific:
      method: 'POST'
      isArray: true
      url: '/api/votersReg/specific'
