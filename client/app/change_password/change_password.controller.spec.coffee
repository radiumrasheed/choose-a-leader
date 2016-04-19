'use strict'

describe 'Controller: ChangePasswordCtrl', ->

  # load the controller's module
  beforeEach module 'elektorApp'
  ChangePasswordCtrl = undefined
  scope = undefined

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    ChangePasswordCtrl = $controller 'ChangePasswordCtrl',
      $scope: scope

  it 'should ...', ->
    expect(1).toEqual 1
