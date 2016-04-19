'use strict'

describe 'Controller: BallotsCtrl', ->

  # load the controller's module
  beforeEach module 'elektorApp'
  BallotsCtrl = undefined
  scope = undefined

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    BallotsCtrl = $controller 'BallotsCtrl',
      $scope: scope

  it 'should ...', ->
    expect(1).toEqual 1
