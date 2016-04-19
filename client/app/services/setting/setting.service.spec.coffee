'use strict'

describe 'Service: setting', ->

  # load the service's module
  beforeEach module 'elektorApp'

  # instantiate service
  setting = undefined
  beforeEach inject (_setting_) ->
    setting = _setting_

  it 'should do something', ->
    expect(!!setting).toBe true
