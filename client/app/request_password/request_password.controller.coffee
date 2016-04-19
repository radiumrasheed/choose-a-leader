'use strict'

angular.module 'elektorApp'
.controller 'RequestPasswordCtrl', ( $scope, Auth, toastr ) ->
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

    Auth.retrievePassword $scope.user, (response) ->
      $scope.submitting = false
      $scope.formSuccess = response.message

      $scope.user = {}
      theForm.$setPristine()
      theForm.$setUnTouched()
    , (e) ->
      $scope.submitting = false
      $scope.formError = e.data.message
      toastr.error e.data.message

