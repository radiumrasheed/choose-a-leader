'use strict'

angular.module 'elektorApp'
.service 'Contestants', ($resource) ->
# AngularJS will instantiate a singleton by calling 'new' on this function
  $resource "/api/contestants/:id", null,
    getContestants:
      method: 'GET'
      isArray: true
      url: '/api/contestants/list'

