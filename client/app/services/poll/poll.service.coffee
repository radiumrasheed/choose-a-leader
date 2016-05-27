'use strict'

angular.module 'elektorApp'
.service 'Poll',  ( $resource ) ->
  $resource "api/polls/:id", null,
    update: method: "PUT"
    delete: method: "DELETE"
    my_polls:
      method: "GET"
      isArray: true
      url: "api/polls/user_polls"
    published_polls:
      method: "GET"
      isArray: true
      url: "api/polls/published_polls"
      
    positionsDetailed:
      method: "GET"
      isArray: true
      url: "api/polls/positions/:id"
