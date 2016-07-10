'use strict'

angular.module 'elektorApp'
.controller 'ContestantsCtrl', ($scope,Contestants) ->
      Contestants.getContestants (cont) ->
        $scope.contestants = cont
