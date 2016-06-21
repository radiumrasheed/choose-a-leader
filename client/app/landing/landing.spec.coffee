'use strict'

describe 'Controller: LandingCtrl', ->

# load the controller's module
  beforeEach module 'elektorApp'
  LandingCtrl = undefined
  scope = undefined

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    LandingCtrl = $controller 'LandingCtrl',
      $scope: scope

  it 'should ...', ->
    expect(1).toEqual 1
