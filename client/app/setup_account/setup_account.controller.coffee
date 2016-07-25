'use strict'

angular.module 'elektorApp'
.controller 'SetupAccountCtrl', ($scope, $timeout, Auth, toastr, Utils, $state, $stateParams, Member, $auth, $window) ->

  $auth.logout()

  $scope.showFirst = true
  $scope.showLast = false
  $scope.confirmation = false
  $scope.master = {}
  $scope.accessCode = null

  $scope.reset = ->
    Member.me  _member: $stateParams.id, (member, extras) ->
      $scope.member = member

      String::replaceAt = (index, character) ->
        @substr(0, index) + character + @substr(index + character.length)

      $scope.member.hiddenPhone = $scope.member.phone.replaceAt(4, '***')

      switch extras('stage')
        when '1' then $scope.step1()
        when '2' then $scope.step2()
        when '3' then $scope.step3()
        when '4' then $scope.redirectToDashoard()
        else $state.go 'landing'

    , (e) ->
      $state.go "landing"

  $scope.redirectToDashoard = ->
    $state.go "landing"
    toastr.info "You have already completed Accreditation"

  $scope.submit = (theForm) ->
    if theForm.$valid
      $scope.submitting = true
      Member.createUser id: $scope.member._id, $scope.member, (user, extras) ->
        if extras('stage') is '3' || extras('stage') is 3
          $scope.submitting = false
          $scope.u = angular.copy user
          $scope.master = angular.copy user
          $scope.u.password = null
          toastr.success "Almost done, Confirm your accreditation code"
          $scope.showFirst = false
          $scope.showNext = false
          $scope.showLast = true
        else
          $scope.submitting = false
          $scope.u = angular.copy user
          $scope.master = angular.copy user
          $scope.u.password = null
          toastr.success "Your Username and default Password has been sent"
          $scope.showNext = true
          $scope.showFirst = false
      , (e)  ->
        $scope.submitting = false
        toastr.error e.data.message
    else
      toastr.error "Please fill the form appropriately before submitting"

  $scope.edit = ->
    $scope.showNext = false

  $scope.step1 = ->
    $scope.showFirst = true
    $scope.showLast = false
    $scope.showNext = false
    $scope.confirmation = false
    $scope.master = {}
    $scope.accessCode = null

  $scope.step2 = ->
    $scope.showFirst = false
    $scope.member
    $scope.jumped = true
    $scope.u = $scope.member._user
    $scope.showLast = false
    $scope.showNext = true

  $scope.step3 = ->
    $scope.showFirst = false
    $scope.master = $scope.member._user
    $scope.showNext = false
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
        theForm.$setPristine()
        toastr.error e.data.message

    else
      $scope.formError = "All fields are required"

  $scope.resendCode = ->
    $scope.resendingCode = true
    Auth.resendCode _member: $scope.master._member, (member) ->
      toastr.info "Accreditation Code Re-Sent!"
      $scope.resendingCode = false

  $scope.resendPassword = ->
    $scope.resendingPassword = true
    Member.resendPassword _member: $scope.u._member, (result) ->
      toastr.info "Username and Password Re-Sent!"
      $scope.resendingPassword = false

  $scope.compareCode = (form) ->
    if form.$valid
      $scope.submitting = true
      Auth.confirmCode id: $scope.master._id, code: $scope.master.accessCode, $scope.master, (response) ->
        toastr.success response.message
        $scope.submitting = false
        $scope.confirmation = true
        $scope.confirmationMessage =response.message
      , (e) ->
        $scope.submitting = false
        toastr.error e.data.message

  dashboard = ->
    $state.go "dashboard"

  $scope.reset()
