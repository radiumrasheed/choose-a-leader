'use strict'

describe 'Service: branch', ->

  # load the service's module
  beforeEach module 'elektorApp'

  # instantiate service
  branch = undefined
  beforeEach inject (_branch_) ->
    branch = _branch_

  it 'should do something', ->
    expect(!!branch).toBe true
