'use strict'

angular.module 'elektorApp'
.config ($stateProvider) ->
  $stateProvider.state 'ballot_receipt',
    url: '/receipts/'
    templateUrl: 'app/ballot_receipt/ballot_receipt.html'
    controller: 'BallotReceiptCtrl'
