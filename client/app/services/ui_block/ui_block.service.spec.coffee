'use strict'

describe 'Service: uiBlock', ->

  # load the service's module
  beforeEach module 'elektorApp'

  # instantiate service
  uiBlock = undefined
  beforeEach inject (_uiBlock_) ->
    uiBlock = _uiBlock_

  it 'should do something', ->
    expect(!!uiBlock).toBe true
