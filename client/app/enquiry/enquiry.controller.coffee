'use strict'

angular.module 'elektorApp'
.controller 'EnquiryCtrl', ($scope, $state, Enquiry,toastr) ->
  $scope.enquiry = {}
  $scope.submitting = false
  $scope.submit = (form) ->
    if form.$valid
      $scope.enquiry.timeSent = moment().format('lll')
      Enquiry.newMail $scope.enquiry,  ->
        $scope.submitting = true
        toastr.success "Enquiry Mail was sent successfully"
      , (e)  ->
        $scope.submitting = false
        toastr.error "Sorry, an error occurred, Message Could Not be sent"
    else
      toastr.error "Sorry, please all fields are required"
