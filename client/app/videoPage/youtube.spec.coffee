'use strict'

describe 'Controller: VideoCtrl', ->

# load the controller's module
  beforeEach module 'elektorApp'
  VideoCtrl = undefined
  scope = undefined

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    VideoCtrl = $controller 'VideoCtrl',
      $scope: scope

  it 'should ...', ->
    expect(1).toEqual 1
