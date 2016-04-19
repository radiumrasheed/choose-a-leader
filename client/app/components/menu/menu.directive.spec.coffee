'use strict'

describe 'Directive: menu', ->

  # load the directive's module and view
  beforeEach module 'elektorApp'
  beforeEach module 'components/menu/menu.html'
  element = undefined
  scope = undefined
  beforeEach inject ($rootScope) ->
    scope = $rootScope.$new()

  it 'should make hidden element visible', inject ($compile) ->
    element = angular.element '<menu></menu>'
    element = $compile(element) scope
    scope.$apply()
    expect(element.text()).toBe 'this is the menu directive'

