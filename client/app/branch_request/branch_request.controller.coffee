'use strict'

angular.module 'elektorApp'
.controller 'BranchRequestCtrl', ( $scope, Member, $stateParams, toastr, $state, $sessionStorage, BranchRequest ) ->
  
  $scope.member = $sessionStorage.tempMember
  
  if not $scope.member? or $scope.member._id isnt $stateParams.id
    $state.go "login"

  $scope.br =
    _member: $stateParams.id
    email: $scope.member.email
  
  $scope.sendRequest = (theForm) ->
    $scope.submitting = true
    $scope.formError = null
    $scope.formSuccess = null

    if theForm.$valid
      br = new BranchRequest $scope.br
      br.$save ->
        $scope.formSuccess = "Branch Update Request Sent Successfully. You'd be notified once this is effected."
        $scope.submitting = false

        $sessionStorage.tempMember = null
      , (e) ->
        $scope.submitting = false
        $scope.formError = e.data.message
        toastr.error e.data.message
    else toastr.error "Please fill the form before submitting"