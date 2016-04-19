'use strict'

describe 'Service: poll', ->

  # load the service's module
  beforeEach module 'elektorApp'

  # instantiate service
  poll = undefined
  beforeEach inject (_poll_) ->
    poll = _poll_

  it 'should do something', ->
    expect(!!poll).toBe true
