'use strict'

describe 'Controller: PublishedRegisterCtrl', ->

  # load the controller's module
  beforeEach module 'elektorApp'
  PublishedRegisterCtrl = undefined
  scope = undefined

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    PublishedRegisterCtrl = $controller 'PublishedRegisterCtrl',
      $scope: scope

  it 'should ...', ->
    expect(1).toEqual 1
