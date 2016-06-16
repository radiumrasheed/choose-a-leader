'use strict'

angular.module 'elektorApp'
.controller 'ResultDetailsCtrl', ( $scope, Vote, $timeout, $rootScope, toastr, $stateParams, Poll ) ->
  $scope.sortType = "_id.index"

  pollId = $stateParams.id

  Poll.positionsDetailed id : pollId, (positions)  ->
    $scope.positions = positions
    $scope.standings()

  Poll.get id: pollId, (poll) ->
    $scope.poll = poll
    if not poll.published then $state.go "results"

  # Fetch Poll Results Every 30 Seconds
  $scope.standings = ->
    Vote.stats _poll: pollId, (results) ->
      _.each results, (position, _index) ->
        pId = position._id._id
        realPosition = _.find $scope.positions, (p) -> p._id is pId
        _.each realPosition.candidates, (c) ->
          voteResult = _.find position.votes, (v) -> v.candidate._id is c._member._id
          if not voteResult?
            results[_index].votes.push
              candidate: c._member
              count: 0
        results[_index].votes = _.sortBy(position.votes, 'count').reverse()

      $scope.results = results
      $rootScope.$broadcast "pollResults", results
      $timeout ->
        $scope.standings()
      , 30000
    return

  $scope.chartData = (title, candidates) ->
    chartObject =
      type: "ColumnChart"
      options:
        title: title
      data:
        cols: [
          {id: "t", label: "Topping", type: "string"}
          {id: "s", label: "Votes", type: "number"}
        ]
        rows: []

    _.each candidates, (c) ->
      chartObject.data.rows.push
        c: [
          { v: [c.candidate.surname, (c.candidate.firstName||c.candidate.othername) ].join ' ' }
          { v: c.count }
        ]

    chartObject