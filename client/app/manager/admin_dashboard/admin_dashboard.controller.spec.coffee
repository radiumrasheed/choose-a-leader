'use strict'

describe 'Controller: AdminDashboardCtrl', ->

  # load the controller's module
  beforeEach module 'elektorApp'
  AdminDashboardCtrl = undefined
  scope = undefined

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    AdminDashboardCtrl = $controller 'AdminDashboardCtrl',
      $scope: scope

  it 'should ...', ->
    expect(1).toEqual 1
