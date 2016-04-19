'use strict'

describe 'Controller: ResultsCtrl', ->

  # load the controller's module
  beforeEach module 'elektorApp'
  ResultsCtrl = undefined
  scope = undefined

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    ResultsCtrl = $controller 'ResultsCtrl',
      $scope: scope

  it 'should ...', ->
    expect(1).toEqual 1
