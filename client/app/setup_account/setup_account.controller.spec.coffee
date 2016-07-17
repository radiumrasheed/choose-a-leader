'use strict'

describe 'Controller: SetupAccountCtrl', ->

  # load the controller's module
  beforeEach module 'elektorApp'
  SetupAccountCtrl = undefined
  scope = undefined

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    SetupAccountCtrl = $controller 'SetupAccountCtrl',
      $scope: scope

  it 'should ...', ->
    expect(1).toEqual 1
