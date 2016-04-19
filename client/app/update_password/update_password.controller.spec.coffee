'use strict'

describe 'Controller: UpdatePasswordCtrl', ->

  # load the controller's module
  beforeEach module 'elektorApp'
  UpdatePasswordCtrl = undefined
  scope = undefined

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    UpdatePasswordCtrl = $controller 'UpdatePasswordCtrl',
      $scope: scope

  it 'should ...', ->
    expect(1).toEqual 1
