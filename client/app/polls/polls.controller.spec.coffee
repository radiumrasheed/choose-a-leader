'use strict'

describe 'Controller: PollsCtrl', ->

  # load the controller's module
  beforeEach module 'elektorApp'
  PollsCtrl = undefined
  scope = undefined

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    PollsCtrl = $controller 'PollsCtrl',
      $scope: scope

  it 'should ...', ->
    expect(1).toEqual 1
