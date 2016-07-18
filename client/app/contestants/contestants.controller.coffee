'use strict'

angular.module 'elektorApp'
.controller 'ContestantsCtrl', ($scope, Contestants, $modal) ->
  modal = null
  Contestants.getContestants (cont) ->
    $scope.contestants = cont
    
  $scope.viewProfile = (contestant) ->
    $scope.candidate = contestant
    modal = $modal.open
      templateUrl: "app/contestants/contestant.html"
      scope: $scope
      backdrop: 'static'
      size: 'lg'
#      windowClass: 'app-modal-window'

  $scope.closeModal = ->
    $scope.candidate = null
    modal.dismiss()