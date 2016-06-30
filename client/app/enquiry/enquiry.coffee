'use strict'

angular.module 'elektorApp'
.config ($stateProvider) ->
  $stateProvider.state 'enquiry',
    url: '/enquiry'
    templateUrl: 'app/enquiry/enquiry.html'
    controller: 'EnquiryCtrl'
    guestView: true
