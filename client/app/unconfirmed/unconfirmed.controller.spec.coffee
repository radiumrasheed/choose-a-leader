'use strict'

describe 'Controller: UnconfirmedCtrl', ->

  # load the controller's module
  beforeEach module 'elektorApp'
  UnconfirmedCtrl = undefined
  scope = undefined

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    UnconfirmedCtrl = $controller 'UnconfirmedCtrl',
      $scope: scope

  it 'should ...', ->
    expect(1).toEqual 1
