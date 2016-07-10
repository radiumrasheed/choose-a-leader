'use strict'

describe 'Service: Contestants', ->

  # load the service's module
  beforeEach module 'elektorApp'

  # instantiate service
  contestants = undefined
  beforeEach inject (_contestants_) ->
    contestants = _contestants_

  it 'should do something', ->
    expect(!!contestants).toBe true
