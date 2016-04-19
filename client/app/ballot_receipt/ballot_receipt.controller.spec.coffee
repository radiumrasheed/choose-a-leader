'use strict'

describe 'Controller: BallotReceiptCtrl', ->

  # load the controller's module
  beforeEach module 'elektorApp'
  BallotReceiptCtrl = undefined
  scope = undefined

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    BallotReceiptCtrl = $controller 'BallotReceiptCtrl',
      $scope: scope

  it 'should ...', ->
    expect(1).toEqual 1
