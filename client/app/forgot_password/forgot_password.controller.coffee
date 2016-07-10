'use strict'

angular.module 'elektorApp'
.controller 'ForgotPasswordCtrl', ( $scope, Auth, toastr ) ->
  $scope.user = {}
  $scope.phoneNumberPattern = (->
    regexp = /^\(?(\d{4})\)?[ .-]?(\d{3})[ .-]?(\d{4})$/
    test: (value) ->
      regexp.test value
  )()

  $scope.sendRequest = (theForm) ->
    $scope.submitting = true
    $scope.formError = null
    $scope.formSuccess = null

    Auth.resetRequest $scope.user, (response) ->
      $scope.submitting = false
      $scope.formSuccess = response.message
      toastr.success response.message
#      $scope.user = {}
#      theForm.$setPristine()
#      theForm.$setUntouched()
      $scope.requested = true
    , (e) ->
      $scope.submitting = false
      $scope.formError = e.data.message
      toastr.error e.data.message



  $scope.verifyRequest = (the2ndForm) ->
    $scope.submitting1 = true
    $scope.formError1 = null
    $scope.formSuccess1 = null

    Auth.verifyResetRequest $scope.user, (response) ->
      $scope.submitting1 = false
      $scope.formSuccess1 = response.message

      $scope.user = {}
      the2ndForm.$setPristine()
      the2ndForm.$setUntouched()
    , (e) ->
      $scope.submitting1 = false
      $scope.formError1 = e.data.message
      toastr.error e.data.message

