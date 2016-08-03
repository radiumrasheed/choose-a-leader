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
    statsByMembers:
      method: 'GET'
      url: '/api/votes/statsByMembers'
      isArray: true
    statsByBranches:
      method: 'GET'
      url: '/api/votes/statsByBranches'
      isArray: true
    lawStats:
      method: 'GET'
      url: '/api/votes/lawyerStats'
      isArray: true
    branchStats:
      method: 'GET'
      url: '/api/votes/branchStats'
      isArray: true
    positionStats:
      method: 'GET'
      url: '/api/votes/positionStats'
      isArray: true
    boardStats:
      method: 'GET'
      url: '/api/votes/boardStats'
  #      isArray: true

    allReceipts:
      method: 'GET'
      url: '/api/votes/allReceipts'
      isArray: true

    voteRoll:
      method: 'GET'
      url: '/api/votes/voteRoll'

    membersByBranch:
      method: 'GET'
      url: '/api/votes/membersByBranch'
      isArray: true