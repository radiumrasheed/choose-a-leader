'use strict'

angular.module 'elektorApp'
.controller 'PreSetupCtrl', ($scope, toastr, Utils, $state, $stateParams, Member, Person, $auth) ->
  $auth.logout()

  $scope.done = false

  Member.me  _member: $stateParams.id, (member) ->
    $scope.member = member

  $scope.person = {}

  $scope.submit = (theForm) ->
    if theForm.$valid
      $scope.submitting = true
      $scope.person.fullname = $scope.member.surname+' '+$scope.member.firstName
      console.log $scope.person
      
      person = new Person $scope.person
      person.$save().then (p) ->
        console.log p
      $scope.submitting = false
      $scope.done = true
      toastr.success "Update Successful"
      , (e)  ->
        $scope.submitting = false
        toastr.error e.data.message
    else
      toastr.error "Please fill the form appropriately before submitting"