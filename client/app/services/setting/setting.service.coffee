'use strict'

angular.module 'elektorApp'
.service 'Setting', ( $resource ) ->
  # AngularJS will instantiate a singleton by calling 'new' on this function
  $resource "/api/settings/:id", null,
    update: method: "PUT"
    memberStats:
      method: "GET"
      isArray: true
      url: "/api/settings/stats"