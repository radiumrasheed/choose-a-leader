'use strict'

angular.module 'elektorApp'
.controller 'SetupAccountCtrl', ($scope, Auth, toastr, Utils, $state) ->

  $scope.reset = ->
    Auth.me (user) ->
      $scope.user = user
      $scope.user._member.firstName = angular.copy $scope.user._member.othername

  $scope.reset()

  $scope.submit = (theForm) ->

    if theForm.$valid
      $scope.submitting = true
      Auth.update
        id: $scope.user._id
        sendCode: true
      , $scope.user, ->
        $scope.submitting = false
        toastr.success "Update Successful."
        $scope.showNext = true
      , (e)  ->
        $scope.submitting = false
        toastr.error e.data.message
    else
      toastr.error "Please fill the form appropriately before submitting"

  $scope.accessCode = null

  $scope.edit = ->
    $scope.showNext = false

  $scope.resendCode = ->
    $scope.resendingCode = true
    Auth.resendCode ->
      toastr.info "Access Code Re-Sent!"
      $scope.resendingCode = false

  $scope.compareCode = (form) ->
    if form.$valid
      $scope.submitting = true
      Auth.confirmCode id: $scope.user._id, code: $scope.accessCode, (response) ->
        toastr.success response.message
        $state.go "dashboard"
      , (e) ->
        $scope.submitting = false
        toastr.error e.data.message