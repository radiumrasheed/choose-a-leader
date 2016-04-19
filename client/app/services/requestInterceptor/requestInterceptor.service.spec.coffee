'use strict'

describe 'Service: requestInterceptor', ->

  # load the service's module
  beforeEach module 'elektorApp'

  # instantiate service
  requestInterceptor = undefined
  beforeEach inject (_requestInterceptor_) ->
    requestInterceptor = _requestInterceptor_

  it 'should do something', ->
    expect(!!requestInterceptor).toBe true
