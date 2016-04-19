'use strict'

angular.module 'elektorApp'
.directive 'menu', ->
  templateUrl: 'app/components/menu/menu.html'
  controller: ($attrs, $scope) ->
    $scope.name = $scope.$parent.$eval $attrs.name
  controllerAs: 'ctrl'

