'use strict'

describe 'Service: Voters_Register', ->

  # load the service's module
  beforeEach module 'elektorApp'

  # instantiate service
  Voters_Register = undefined
  beforeEach inject (_Voters_Register_) ->
    Voters_Register = _Voters_Register_

  it 'should do something', ->
    expect(!!Voters_Register).toBe true
