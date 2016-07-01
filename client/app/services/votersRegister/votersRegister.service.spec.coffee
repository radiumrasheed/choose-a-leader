'use strict'

describe 'Service: VotersRegister', ->

  # load the service's module
  beforeEach module 'elektorApp'

  # instantiate service
  VotersRegister = undefined
  beforeEach inject (_VotersRegister_) ->
    VotersRegister = _VotersRegister_

  it 'should do something', ->
    expect(!!VotersRegister).toBe true
