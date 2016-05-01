'use strict'

angular.module 'elektorApp'
.controller 'ProfileCtrl', ($scope, Auth, toastr, $state) ->

  Auth.me (user) ->
    if user.role isnt "member"
      $state.go "login"
    else
      $scope.user = user
      $scope.user._member.lastModified = new Date $scope.user._member.lastModified
      $scope.user._member.dateOfBirth = new Date $scope.user._member.dateOfBirth

      $scope.updateProfile = (theForm) ->
        if theForm.$valid
          Auth.update id: $scope.user._id, $scope.user, (u) ->
            $scope.user = u
            $scope.user._member.lastModified = new Date u._member.lastModified
            $scope.user._member.dateOfBirth = new Date u._member.dateOfBirth
            toastr.success "Update Successful"
        else toastr.error "Please fill the form appropriately before submitting"
