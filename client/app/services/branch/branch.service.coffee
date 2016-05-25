'use strict'

angular.module 'elektorApp'
.service 'Branch', ( $resource ) ->
  $resource "api/branches/:id", null,
    update: method: "PUT"
    merge:
      method: "POST"
      url: "api/branches/merge"

.directive 'branchSelectPlugin', ( Branch ) ->
  restrict: 'A'
  link: (scope, elem, attr) ->
    angular.element(elem).select2
      placeholder: attr.branchSelectPlugin
      minimumInputLength: 3
      allowClear: true
      query: (options) ->
        Branch.query name:options.term, (branches) ->
          options.callback
            more:false
            results: branches
      id: (e) -> e._id

      formatResult: (branch) -> "<p>#{branch.name}</p><span class='label label-primary' ng-show='branch.state'>#{branch.state}</span>"
      formatSelection: (branch) -> "#{branch.name}"
      dropdownCssClass: "bigdrop"
      escapeMarkup: (m) -> m
      initSelection: (element, callback) ->
        ###console.log element
        alert "Called"###
        data =
          name: element.val()
          state: element.data "state"
        callback data