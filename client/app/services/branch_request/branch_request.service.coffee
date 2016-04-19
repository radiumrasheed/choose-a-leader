'use strict'

angular.module 'elektorApp'
.service 'BranchRequest', ( $resource )->
  # AngularJS will instantiate a singleton by calling 'new' on this function
  $resource "api/branch_requests/:id", null,
    update: method: "PUT"