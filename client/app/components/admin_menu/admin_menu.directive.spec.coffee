'use strict'

describe 'Directive: adminMenu', ->

  # load the directive's module and view
  beforeEach module 'elektorApp'
  beforeEach module 'app/manager/admin_menu/admin_menu.html'
  element = undefined
  scope = undefined
  beforeEach inject ($rootScope) ->
    scope = $rootScope.$new()

  it 'should make hidden element visible', inject ($compile) ->
    element = angular.element '<admin-menu></admin-menu>'
    element = $compile(element) scope
    scope.$apply()
    expect(element.text()).toBe 'this is the adminMenu directive'

