'use strict'

describe 'Controller: RequestPasswordCtrl', ->

  # load the controller's module
  beforeEach module 'elektorApp'
  RequestPasswordCtrl = undefined
  scope = undefined

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    RequestPasswordCtrl = $controller 'RequestPasswordCtrl',
      $scope: scope

  it 'should ...', ->
    expect(1).toEqual 1
