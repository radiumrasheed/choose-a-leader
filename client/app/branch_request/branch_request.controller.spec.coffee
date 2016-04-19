'use strict'

describe 'Controller: BranchRequestCtrl', ->

  # load the controller's module
  beforeEach module 'elektorApp'
  BranchRequestCtrl = undefined
  scope = undefined

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    BranchRequestCtrl = $controller 'BranchRequestCtrl',
      $scope: scope

  it 'should ...', ->
    expect(1).toEqual 1
