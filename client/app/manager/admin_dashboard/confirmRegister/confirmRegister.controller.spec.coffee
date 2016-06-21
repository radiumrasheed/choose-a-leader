'use strict'

describe 'Controller: ConfirmRegisterCtrl', ->

  # load the controller's module
  beforeEach module 'elektorApp'
  ConfirmRegisterCtrl = undefined
  scope = undefined

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    ConfirmRegisterCtrl = $controller 'ConfirmRegisterCtrl',
      $scope: scope

  it 'should ...', ->
    expect(1).toEqual 1
