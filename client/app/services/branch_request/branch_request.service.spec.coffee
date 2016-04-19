'use strict'

describe 'Service: branchRequest', ->

  # load the service's module
  beforeEach module 'elektorApp'

  # instantiate service
  branchRequest = undefined
  beforeEach inject (_branchRequest_) ->
    branchRequest = _branchRequest_

  it 'should do something', ->
    expect(!!branchRequest).toBe true
