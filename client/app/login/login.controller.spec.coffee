'use strict'

describe 'Controller: LoginCtrl', ->

  # load the controller's module
  beforeEach module 'elektorApp'
  LoginCtrl = undefined
  scope = undefined

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    LoginCtrl = $controller 'LoginCtrl',
      $scope: scope

  it 'should ...', ->
    expect(1).toEqual 1
