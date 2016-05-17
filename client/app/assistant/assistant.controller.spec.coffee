'use strict'

describe 'Controller: AssistantCtrl', ->

# load the controller's module
  beforeEach module 'elektorApp'
  AssistantCtrl = undefined
  scope = undefined

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    AssistantCtrl = $controller 'AssistantCtrl',
      $scope: scope

  it 'should ...', ->
    expect(1).toEqual 1
