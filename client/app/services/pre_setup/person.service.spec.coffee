'use strict'

describe 'Service: person', ->

  # load the service's module
  beforeEach module 'elektorApp'

  # instantiate service
  person = undefined
  beforeEach inject (_person_) ->
    person = _person_

  it 'should do something', ->
    expect(!!person).toBe true
