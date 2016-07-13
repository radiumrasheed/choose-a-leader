'use strict'

angular.module 'elektorApp'
.service 'Member', ($resource)->
  # AngularJS will instantiate a singleton by calling 'new' on this function
  $resource '/api/members/:id', null,
    createNewMember:
      url: 'api/members/newMember'
      method: "POST"
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
    getMember:
      method: "POST"
      url: '/api/members/getmember'
    createLink:
      method: "GET"
      url: '/api/members/createLink'
    detailLink:
      method: 'GET'
      url: '/api/members/detailLink'
    updateSurname:
      url: 'api/members/updateSurname'
      method: "POST"

.directive 'memberSelectPlugin', ( Member ) ->
  restrict: 'A'
  link: (scope, elem, attr) ->
    angular.element(elem).select2
      placeholder: attr.branchSelectPlugin
      minimumInputLength: 3
      allowClear: true
      query: (options) ->
        if scope.$parent.$parent._branchOfAdmin?
          options.branch = scope.$parent.$parent._branchOfAdmin._id
        Member.query name:options.term, _branch:options.branch, (branches) ->
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
