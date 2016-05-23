'use strict'

describe 'Controller: PreSetupCtrl', ->

  # load the controller's module
  beforeEach module 'elektorApp'
  PreSetupCtrl = undefined
  scope = undefined

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    PreSetupCtrl = $controller 'PreSetupCtrl',
      $scope: scope

  it 'should ...', ->
    expect(1).toEqual 1
