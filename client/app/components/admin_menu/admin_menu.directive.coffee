'use strict'

angular.module 'elektorApp'
.directive 'adminMenu', ->
  templateUrl: 'app/components/admin_menu/admin_menu.html'
  restrict: 'EA'
  controller: ($attrs, $scope, $rootScope, Auth,Voters_Register) ->
    Auth.me (usr) ->
      if usr.role is "branch_admin"
        $scope.isBranchAdmin = true
        $rootScope.isBranchAdmin = true
        $scope._branchOfAdmin = usr._member._branch
        $rootScope._branchOfAdmin = usr._member._branch

    Voters_Register.getCount (count) ->
      $scope.VotersToConfirm = count.count
  controllerAs: 'ctrl'
