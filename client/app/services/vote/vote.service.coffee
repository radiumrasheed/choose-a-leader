'use strict'

angular.module 'elektorApp'
.service 'Vote', ($resource) ->
  # AngularJS will instantiate a singleton by calling 'new' on this function
  $resource "/api/votes/:id", null,
    update: method: "PUT"
    submitBallot:
      method: 'POST'
      url: '/api/votes/ballot'
    receipt:
      method: 'GET'
      url: '/api/votes/receipt'
      isArray: true
    votesForPosition:
      method: 'GET'
      url: '/api/votes/results/:id'
      isArray: true
    stats:
      method: 'GET'
      url: '/api/votes/stats'
      isArray: true
    positionStats:
      method: 'GET'
      url: '/api/votes/positionStats'
      isArray: true
    candidates:
      method: 'GET'
      url: '/api/votes/candidates'
      isArray: true
    statsByMembers:
      method: 'GET'
      url: '/api/votes/statsByMembers'
      isArray: true