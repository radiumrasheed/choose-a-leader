'use strict'

angular.module 'elektorApp'
.controller 'SetupAccountCtrl', ($scope,$timeout, Auth, toastr, Utils, $state, $stateParams, Member, $auth) ->
  $auth.logout()
  $scope.showLast = false
  $scope.confirmation = false
  $scope.master = {}
  $scope.reset = ->
    Member.me  _member: $stateParams.id, (member) ->
      if member.accredited is true
        $state.go "login"
      $scope.member = member
#      $scope.member.firstName = angular.copy $scope.member.othername

  $scope.reset()

  $scope.submit = (theForm) ->
    if theForm.$valid
      $scope.submitting = true
      Member.createUser id: $scope.member._id, $scope.member, (user) ->
        $scope.submitting = false
        $scope.u = angular.copy user
        $scope.master = angular.copy user
        $scope.u.password = null
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

  $scope.step1 = ->
    $scope.showLast = false
    $scope.showNext = false

  $scope.step2 = ->
    $scope.member
    $scope.jumped = true
    $scope.u = $scope.member._user
    $scope.showLast = false
    $scope.showNext = true

  $scope.step3 = ->
    $scope.showNext = true
    $scope.showLast = true

  $scope.changePassword = (theForm) ->
    if theForm.$valid
      $scope.submitting = true
      $scope.formError = null
      $scope.formSuccess = null

      Auth.changePassword sendCode: true, $scope.u, (response) ->
        $scope.submitting = false
        toastr.success response.message
        $scope.password_cnf = null
        theForm.$setPristine()
        $scope.showNext = false
#       send user object as $scope.master to confirm password
        if $scope.master = {}
          $scope.master = $scope.u
        $scope.showLast = true

      , (e) ->
        $scope.submitting = false
        $scope.formError = e.data.message
        toastr.error e.data.message

    else
      $scope.formError = "All fields are required"

  $scope.resendCode = ->
    $scope.resendingCode = true
    Auth.resendCode ->
      toastr.info "Access Code Re-Sent!"
      $scope.resendingCode = false

  $scope.compareCode = (form) ->
    if form.$valid
      $scope.submitting = true
      $scope.confirmation = true
      Auth.confirmCode id: $scope.master._id, code: $scope.accessCode, $scope.master, (response) ->
        toastr.success response.message

        $scope.confirmationMessage =response.message
      , (e) ->
        $scope.submitting = false
        toastr.error e.data.message


  dashboard = ->
    $state.go "dashboard"
