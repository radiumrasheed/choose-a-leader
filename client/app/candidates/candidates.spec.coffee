'use strict'

describe 'Controller: CandidatesCtrl', ->

# load the controller's module
  beforeEach module 'elektorApp'
  HelpCtrl = undefined
  scope = undefined

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    HelpCtrl = $controller 'CandidatesCtrl'
      $scope: scope

  it 'should ...', ->
    expect(1).toEqual 1
