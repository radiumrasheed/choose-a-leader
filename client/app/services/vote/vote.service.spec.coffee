'use strict'

describe 'Service: vote', ->

  # load the service's module
  beforeEach module 'elektorApp'

  # instantiate service
  vote = undefined
  beforeEach inject (_vote_) ->
    vote = _vote_

  it 'should do something', ->
    expect(!!vote).toBe true
