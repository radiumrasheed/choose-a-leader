'use strict'

describe 'Controller: ResultDetailsCtrl', ->

  # load the controller's module
  beforeEach module 'elektorApp'
  ResultDetailsCtrl = undefined
  scope = undefined

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    ResultDetailsCtrl = $controller 'ResultDetailsCtrl',
      $scope: scope

  it 'should ...', ->
    expect(1).toEqual 1
