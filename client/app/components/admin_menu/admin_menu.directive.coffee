'use strict'

angular.module 'elektorApp'
.directive 'adminMenu', ->
  templateUrl: 'app/components/admin_menu/admin_menu.html'
  restrict: 'EA'
  controller: ($attrs, $scope, $rootScope, Auth, VotersRegister) ->
    Auth.me (usr) ->
      if usr.role is "branch_admin"
        $scope.isBranchAdmin = true
        $rootScope.isBranchAdmin = true
        $scope._branchOfAdmin = usr._member._branch
        $rootScope._branchOfAdmin = usr._member._branch

    VotersRegister.getCount (count) ->
      $scope.VotersToConfirm = count.count
  controllerAs: 'ctrl'
