'use strict'

describe 'Service: Enquiry', ->

  # load the service's module
  beforeEach module 'elektorApp'

  # instantiate service
  enquiry = undefined
  beforeEach inject (_enquiry_) ->
    enquiry = _enquiry_

  it 'should do something', ->
    expect(!!branch).toBe true
