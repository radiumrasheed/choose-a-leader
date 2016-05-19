'use strict'

angular.module 'elektorApp'
.controller 'BallotsCtrl', ($scope, Poll, $stateParams, Position, $state, $window, toastr, Vote, Setting, $rootScope, Auth, $auth, $sessionStorage, $log, $modal) ->

  $scope.showBallotPage = false

  Auth.me (user) ->
    $scope.user = user

    if user._member._branch is undefined or user._member._branch is null
      $auth.logout()
      $sessionStorage.tempMember = user._member
      $state.go "branch_request", id: user._member._id

    # Retrieve Poll Details
    Poll.get id: $stateParams.id, (poll) ->
      $scope.poll = poll

      if moment().isAfter(poll.opens) and moment().isBefore(poll.closes)
        # Check if User has voted before
        Vote.query pollId: $stateParams.id
        .$promise.then (votes) ->
#          console.log votes
          if votes.length then $scope.message = "You've cast your ballot already. The results would be ready " + $rootScope.ago poll.closes
          else
            $scope.showBallotPage = true
            $scope.ballot = _poll: $stateParams.id
            $scope.selected = {}
            $scope.collapse = []

            Position.ballotPaper _poll: $stateParams.id
            .$promise.then (positions) ->
              $scope.positions = positions

              _.each positions, (p) ->
                $scope.collapse.push true
                $scope.ballot[p._id] = ""
                $scope.selected[p._id] = {}
                _.map p.candidates, (c) ->
                  $scope.selected[p._id][c._id] = false
      else if moment().isBefore poll.opens
        $scope.message = "The Voting Window is yet to Open. Please check again " + $rootScope.ago poll.opens
      else if moment().isAfter poll.closes
        $scope.message = "The Voting Window Closed " + $rootScope.ago(poll.closes) + " and Voting has ended"

    $scope.toggleCollapse = (index) ->
      $scope.collapse[index] = not $scope.collapse[index]

    $scope.setChoice = (position, candidate) ->
      $scope.ballot[position] = candidate
      # Mark Candidate as Selected
      keys = _.keys $scope.selected[position]
      _.each keys, (k) ->
        $scope.selected[position][k] = k is candidate._id
        return

    $scope.cancelChoice = (position) ->
      $scope.ballot[position] = null
      keys = _.keys $scope.selected[position]
      _.each keys, (k) ->
        $scope.selected[position][k] = false
        return

    $scope.ballotFilled = ->
      keys = _.keys $scope.ballot
      filled = true
      _.each keys, (k) ->
        if typeof $scope.ballot[k] is "object" then filled = false
      return filled

    $scope.showReceipt = ->
      if !$scope.ballotFilled()
        # Pre-process Receipt
        $scope.showingReceipt = true

    $scope.backToBallot = ->
      delete $scope.ballot["password"]
      delete $scope.ballot["accessCode"]
  #    $window.location.href = $state.get('ballots').url
      $scope.showingReceipt = false

    $scope.submitBallot = (form) ->
      if form.$valid
        Vote.submitBallot $scope.ballot, ->
          toastr.success "Ballot Cast Successfully"
          $state.go "ballot_receipt"
        , (err) ->
          toastr.error err.data.message
      else toastr.error "Please fill the form before submitting."

    $scope.open = (bio) ->
      modalInstance = $modal.open(
        animation: $scope.animationsEnabled
        templateUrl: 'bioModalContent.html'
        controller: 'ModalInstanceCtrl'
        size: 'lg'
        resolve: bio: ->
          $scope.bio
          $scope.bio = bio
      )
      modalInstance.result.then ((bio) ->
        $scope.selected = bio
        return
      ), ->
        $log.info 'Modal dismissed at: ' + new Date
        return
      return

    $scope.toggleAnimation = ->
      $scope.animationsEnabled = !$scope.animationsEnabled
      return

.controller 'ModalInstanceCtrl', ($scope, $modalInstance, bio) ->
  $scope.bio = bio

  $scope.cancel = ->
    $modalInstance.dismiss 'cancel'