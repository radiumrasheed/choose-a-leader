'use strict'

angular.module 'elektorApp'
.service 'Member', ($resource)->
  # AngularJS will instantiate a singleton by calling 'new' on this function
  $resource '/api/members/:id', null,
    createUser:
      url: 'api/members/createUser'
      method: "PUT"
    update:
      method: "PUT"
    me:
      url: '/api/members/me'
      method: 'GET'
    retrievePassword:
      method:'POST'
      url: '/api/members/requestPassword'


.directive 'memberSelectPlugin', ( Member ) ->
  restrict: 'A'
  link: (scope, elem, attr) ->
    angular.element(elem).select2
      placeholder: attr.branchSelectPlugin
      minimumInputLength: 3
      allowClear: true
      query: (options) ->
        Member.query name:options.term, (branches) ->
          options.callback
            more:false
            results: branches
      id: (e) -> e._id

      formatResult: (m) -> "<p>#{m.firstName || m.othername} #{m.surname}</p><span class='label label-primary' ng-show='branch.state'>#{m.sc_number}</span>"
      formatSelection: (m) -> "#{m.firstName || m.othername} #{m.surname}"
      dropdownCssClass: "bigdrop"
      escapeMarkup: (m) -> m
#      initSelection: (element, callback) ->
#        console.log element
#        data =
#          name: element.val()
#          state: element.data "state"
#        callback data
