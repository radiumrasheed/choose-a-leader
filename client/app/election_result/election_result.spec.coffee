'use strict'

describe 'Controller: ElectionResultCtrl', ->

# load the controller's module
  beforeEach module 'elektorApp'
  ElectionResultCtrl = undefined
  scope = undefined

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    ElectionnResultCtrl = $controller 'ElectionnResultCtrl',
      $scope: scope

  it 'should ...', ->
    expect(1).toEqual 1
