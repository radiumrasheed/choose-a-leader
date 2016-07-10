'use strict'

describe 'Controller: ContestantsCtrl', ->

# load the controller's module
  beforeEach module 'elektorApp'
  ContestantsCtrl = undefined
  scope = undefined

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    ContestantsCtrl = $controller 'ContestantsCtrl',
      $scope: scope

  it 'should ...', ->
    expect(1).toEqual 1
