'use strict'

describe 'Controller: AdminLoginCtrl', ->

  # load the controller's module
  beforeEach module 'elektorApp'
  AdminLoginCtrl = undefined
  scope = undefined

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    AdminLoginCtrl = $controller 'AdminLoginCtrl',
      $scope: scope

  it 'should ...', ->
    expect(1).toEqual 1
