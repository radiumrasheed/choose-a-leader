'use strict'

describe 'Service: position', ->

  # load the service's module
  beforeEach module 'elektorApp'

  # instantiate service
  position = undefined
  beforeEach inject (_position_) ->
    position = _position_

  it 'should do something', ->
    expect(!!position).toBe true
