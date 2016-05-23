'use strict'

angular.module 'elektorApp'
.service 'Person', ($resource)->
  # AngularJS will instantiate a singleton by calling 'new' on this function
  $resource '/api/person/:id', null,
    createUser:
      url: 'api/person/createUser'
      method: "PUT"