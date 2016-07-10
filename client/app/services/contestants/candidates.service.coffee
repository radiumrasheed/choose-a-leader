'use strict'

angular.module 'elektorApp'
.service 'Contestants', ($resource) ->
# AngularJS will instantiate a singleton by calling 'new' on this function
  $resource "/api/contestant/:id", null,
    getContestants:
      method: 'GET'
      isArray: true
      url: '/api/contestant/list'

