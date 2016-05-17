'use strict'

angular.module 'elektorApp'
.controller 'ResultDetailsCtrl', ( $scope, Vote, $timeout, $rootScope, toastr, $stateParams, Poll ) ->

  pollId = $stateParams.id

  Poll.get id: pollId, (poll) ->
    $scope.poll = poll
    if not poll.published then $state.go "results"

  # Fetch Poll Results Every 30 Seconds
  $scope.standings = ->
    Vote.stats _poll: pollId
    , (results) ->
      $scope.results = results
      console.info $scope.results
      $timeout ->
        $scope.standings()
      , 30000
    return
    
  $scope.standings()

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