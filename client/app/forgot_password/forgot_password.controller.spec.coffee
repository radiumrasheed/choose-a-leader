'use strict'

describe 'Controller: ForgotPasswordCtrl', ->

  # load the controller's module
  beforeEach module 'elektorApp'
  ForgotPasswordCtrl = undefined
  scope = undefined

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    ForgotPasswordCtrl = $controller 'ForgotPasswordCtrl',
      $scope: scope

  it 'should ...', ->
    expect(1).toEqual 1
