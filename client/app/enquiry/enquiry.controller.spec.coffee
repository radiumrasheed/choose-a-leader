'use strict'

describe 'Controller: EnquiryCtrl', ->

  # load the controller's module
  beforeEach module 'elektorApp'
  EnquiryCtrl = undefined
  scope = undefined

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    EnquiryCtrl = $controller 'EnquiryCtrl',
      $scope: scope

  it 'should ...', ->
    expect(1).toEqual 1
