'use strict'


angular.module 'elektorApp'
.controller 'AdminDashboardCtrl', ($scope, $rootScope, Auth, $state, Member) ->
  Auth.me (usr) ->
    $scope.usr = usr
    if usr.role is "admin" || usr.role is "branch_admin"
      $scope.message = 'Hello'
      
      $rootScope.$on "pollSettings", (e, data) ->
        $scope.settings = data

      if usr.role is "branch_admin"
        $rootScope.isBranchAdmin = true

        Member.query
          page: 1
          perPage: 20
          _branch: usr._member._branch._id
        , (members, headers) ->
          $scope.members = members
          $scope.total = parseInt headers "total_found"
        Member.query
          page: 1
          verified: true
          perPage: 20
          _branch: usr._member._branch._id
        , (members, headers) ->
          $scope.members = members
          $scope.totalVerified = parseInt headers "total_found"
      else
        if usr.superAdmin is true
          $scope.superAdmin = true
        Member.query
          page: 1
          perPage: 20
        , (members, headers) ->
          $scope.members = members
          $scope.total = parseInt headers "total_found"
        Member.query
          page: 1
          verified: true
          perPage: 20
        , (members, headers) ->
          $scope.members = members
          $scope.totalVerified = parseInt headers "total_found"

    else
      $state.go "dashboard"

.controller 'PositionsCtrl', ($scope, Position, toastr, $stateParams, Poll) ->
  pollId = $stateParams.id
  $scope.poll = Poll.get id: pollId
  $scope.positions = Position.query _poll: pollId
  $scope.position = {}

  $scope.reset = ->
    $scope.position =
      _poll: pollId
      name: null
      description: null
      index : null

  $scope.newPosition = ->
    $scope.showPositionForm = true
    $scope.reset()

  $scope.editPosition = (position) ->
    $scope.position = position
    $scope.showPositionForm = true

  $scope.deletePosition = (position, $index) ->
    if confirm "Are you sure?"
      Position.delete id: position._id, ->
        $scope.positions.splice $index, 1
        $scope.total -= 1

  $scope.hideForm = ->
    $scope.reset()
    $scope.showPositionForm = false

  $scope.submit = (form) ->
    if form.$valid
      if $scope.position._id
        Position.update
          id: $scope.position._id
        , $scope.position
        form.$setPristine()
        form.$setUntouched()
        $scope.hideForm()
      else
        p = new Position $scope.position
        p.$save (result) ->
          $scope.positions.push result
          form.$setPristine()
          form.$setUntouched()
          $scope.hideForm()
    else toastr.error "Please fill the form appropriately"

.controller 'ResultsCtrl', ($scope, Vote, $timeout, $rootScope, Setting, toastr, $stateParams, Poll, Member, $modal, Branch) ->
  $scope.sortType = "_id.index"

  pollId = $stateParams.id

  Poll.positionsDetailed id : pollId, (positions)  ->
    $scope.positions = positions
    $scope.standings()

  $scope.PrintElem = (elem) ->
    $scope.Popup $(elem).html()
    return

  $scope.Popup = (data) ->
    mywindow = window.open('', 'results', 'height=400,width=600')
    mywindow.document.write '<html><head><title>Results</title>'

    ###optional stylesheet###

    #mywindow.document.write('<link rel="stylesheet" href="main.css" type="text/css" />');
    mywindow.document.write '</head><body >'
    mywindow.document.write data
    mywindow.document.write '</body></html>'
    mywindow.document.close()
    # necessary for IE >= 10
    mywindow.focus()
    # necessary for IE >= 10
    mywindow.print()
    mywindow.close()
    true
    
  Poll.get id: pollId, (poll) ->
    $scope.poll = poll
    if $scope.poll.national
      Member.query
        page: 1
        perPage: 20
        verified: true
      , (members, headers) ->
        $scope.members = members
        $scope.total = parseInt headers "total_found"
    else
      Member.query
        page: 1
        perPage: 20
        verified: true
        _branch: $scope.poll._branch._id
      , (members, headers) ->
        $scope.members = members
        $scope.total = parseInt headers "total_found"

    $scope.closed = ->
      moment().isAfter $scope.poll.closes

  $scope.makePublic = ->
    if not $scope.poll.published
      Poll.update
        id: pollId
      , published: true, ->
        Poll.publishPoll id: pollId, $scope.results, ->
          $scope.poll.result = $scope.results
          $scope.poll.published = true
          toastr.success "Results have been published"
    else
      toastr.info "Results have already been published"

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

  $scope.open = (bio) ->
    modalInstance = $modal.open(
      animation: $scope.animationsEnabled
      templateUrl: 'resultModalContent.html'
      controller: 'ModalInstanceCtrl'
      size: 'lg'
      resolve: bio: ->
#        Its MAGIC!!! I was high on coffee - - just leave it, it works
        Vote.statsByBranches _poll: pollId, _position: bio, (resultsByBranches) ->
          $scope.sortType_ = null
          Branch.branchesDetailed (branches) ->
            $scope.branches = branches
            _.each resultsByBranches, (position, _index) ->
              _.each position.votes, (brancheInfo, __index) ->
                _.each $scope.branches, (rb) ->
                  cc = _.find position.votes, (d) -> d.branch._id is rb._id
                  if not cc?
                    position.votes.push
                      branch: rb
                      count: 0
              _.each position.votes, (pv, en) ->
                position.votes[en].name = pv.branch.name
                return
              resultsByBranches[_index].votes = _.sortBy(position.votes, 'name')
              i = 0
              _.each position.votes, (br, ind) ->
                position.votes[ind].name = br.branch.name
                position.votes[ind].index = i++
                return
              return
            resultsByBranches
          return
    )
    modalInstance.result.then ((pos) ->
      $scope.selected = pos
      return
    ), ->
      return
    return

  $scope.printPdf = ->
    console.log "tt"

    doc = new jsPDF

    # We'll make our own renderer to skip this editor
#    specialElementHandlers = '#editor': (element, renderer) ->
#      true
    # All units are in the set measurement for the document
    # This can be changed to "pt" (points), "mm" (Default), "cm", "in"
    doc.fromHTML $('#results').get(0), 15, 15,
      'width': 170
#      'elementHandlers': specialElementHandlers
    doc.save 'result.pdf'

  $scope.chartData = (title, candidates) ->
    chartObject =
      type: "ColumnChart"
      data:
        cols: [
          {id: "t", label: "Topping", type: "string"}
          {id: "s", label: "Votes", type: "number"}
        ]
        rows: []
    _.each candidates, (c) ->
      chartObject.data.rows.push
        c: [
          {v: [c.candidate.surname, (c.candidate.firstName || c.candidate.othername)].join ' '}
          {v: c.count}
        ]
    chartObject.options =
      title: title
    chartObject

.controller 'CandidatesCtrl', ($scope, $stateParams, Position, Candidate, toastr, Member, Upload, cloudinary, $state) ->
  $scope.position = Position.get id: $stateParams.position_id

  # TODO: Make this filterable
  $scope.members = Member.query()

  $scope.$parent.collapse = true

  $scope.closeMe = ->
    $scope.$parent.collapse = false
    $state.go "admin_dashboard.positions", id: $stateParams.id

  $scope.reset = ->
    $scope.loaded = ""
    $scope.photo = null
    $scope.error = null
    $scope.candidate =
      _member: null
      bio: null
      photo: null

  $scope.newCandidate = ->
    $scope.showCandidateForm = true
    $scope.reset()

  $scope.deleteCandidate = (candidate, $index) ->
    if confirm "Are you sure?"
      Candidate.destroyCandidate id: $stateParams.position_id, candidate_id: candidate._id, ->
        $scope.polls.splice $index, 1
        $scope.total -= 1

  $scope.hideForm = (form) ->
    form.$setPristine()
    form.$setUntouched()
    $scope.reset()
    $scope.showCandidateForm = false

  $scope.error = null

  $scope.uploadFile = (file) ->
    $scope.error = null
    Upload.upload
      url: "https://api.cloudinary.com/v1_1/" + cloudinary.config().cloud_name + "/upload"
      data:
        upload_preset: cloudinary.config().upload_preset
        tags: 'elektor'
        context: 'photo=' + $scope.candidate._member
        file: file
    .progress (e) ->
      progress = Math.round((e.loaded * 100.0) / e.total)
      $scope.loaded = "Uploading... #{progress}%"
    .success (data) ->
      $scope.candidate.secure_url = data.secure_url
      $scope.candidate.url = data.url
      $scope.candidate.public_id = data.public_id

      $scope.photo = data
      $scope.loaded = ""
    .error (data) ->
      $scope.loaded = ""
      $scope.error = data.error.message

  $scope.submit = (form) ->
    if form.$valid and $scope.error is null
      $scope.candidate.photo = "" #"data:#{$scope.candidate.photo.filetype};base64,#{$scope.candidate.photo.base64}"
      Position.addCandidate id: $stateParams.position_id, $scope.candidate, (position) ->
        $scope.position = position
        $scope.hideForm form
        $scope.reset()
        toastr.success "Candidate Added Successfully!"
    else toastr.error "Error Saving Candidate Details"

.controller 'MembersCtrl', ($scope, Member, $modal, toastr, $localStorage, Auth) ->
  Auth.me (usr) ->
    if usr.superAdmin is true
      $scope.superAdmin = true

  $scope.sortType = "surname"
  $scope.sortReverse = false
  $scope.searchMembers = ""
  modal = null
  $scope.perPage = $localStorage.memberPerPage or 15
  $scope.currentPage = 1
  $scope.members = []
  $scope.pageSizes = [10, 15, 25, 50, 100, 200, 500]


  $scope.load = (page) ->
    Auth.me (usr) ->
      if usr.role is "branch_admin"
        Member.query
          page: page
          perPage: $scope.perPage
          _branch: usr._member._branch._id
        , (members, headers) ->
          $scope.members = members
          $scope.total = parseInt headers "total_found"
          $scope.pages = Math.ceil($scope.total / $scope.perPage)
      else
        Member.query
          page: page
          perPage: $scope.perPage
        , (members, headers) ->
          $scope.members = members
          $scope.total = parseInt headers "total_found"
          $scope.pages = Math.ceil($scope.total / $scope.perPage)

  $scope.load $scope.currentPage

  $scope.pageChanged = ->
    $localStorage.memberPerPage = $scope.perPage
    $scope.load $scope.currentPage

  $scope.addMember = ->
    $scope.member = {}
    if $scope.superAdmin is true
      modal = $modal.open
        templateUrl: "app/manager/admin_dashboard/views/new-member-form.html"
        scope: $scope
        backdrop: 'static'
        
  $scope.editMember = (member) ->
    $scope.selectedMember = member
    if member.othername?
      $scope.selectedMember.firstName = member.othername?.split(" ")?[0]
      $scope.selectedMember.middleName = member.othername?.split(" ")?[1]

    if $scope.superAdmin is true
      modal = $modal.open
        templateUrl: "app/manager/admin_dashboard/views/member-form.html"
        scope: $scope
        backdrop: 'static'
    else
      modal = $modal.open
        templateUrl: "app/manager/admin_dashboard/views/member-details.html"
        scope: $scope
        backdrop: 'static'

  $scope.closeModal = ->
    $scope.selectedMember = null
    modal.dismiss()

  $scope.updateMember = ->
    Member.update id: $scope.selectedMember._id, $scope.selectedMember, ->
      toastr.success "Member Data Updated"
      $scope.closeModal()
      
  $scope.newMember = (form) ->
    Member.createNewMember $scope.member, (m) ->
      toastr.success "New Member Data Updated"
      $scope.closeModal()

  $scope.verify = (member) ->
    if confirm "Are you sure?"
      Member.update
        id: member._id
      , verified: 1, ->
        member.verified = 1

.controller 'VerifiedRegisterCtrl', ($scope, Member, $localStorage, Auth) ->
  $scope.sortType = "surname"
  $scope.sortReverse = false
  $scope.searchVerifiedRegister = ""
  $scope.perPage = $localStorage.votersRegisterPerPage or 15
  $scope.currentPage = 1
  $scope.pageSizes = [10, 15, 25, 50, 100, 200, 500]

  $scope.load = (page) ->
    Auth.me (usr) ->
      if usr.role is "branch_admin"
        Member.query
          page: page
          verified: true
          perPage: $scope.perPage
          _branch: usr._member._branch._id
        , (members, headers) ->
          $scope.members = members
          $scope.total = parseInt headers "total_found"
          $scope.pages = Math.ceil($scope.total / $scope.perPage)
      else
        Member.query
          page: page
          verified: true
          perPage: $scope.perPage
        , (members, headers) ->
          $scope.members = members
          $scope.total = parseInt headers "total_found"
          $scope.pages = Math.ceil($scope.total / $scope.perPage)
          
  $scope.load $scope.currentPage

  $scope.pageChanged = ->
    $localStorage.votersRegisterPerPage = $scope.perPage
    $scope.load $scope.currentPage
    
  $scope.sendLink = (member) ->
    if confirm "Are you sure"
      Member.createLink id : member._id, (response) ->
         alert "setup link sent to " + response.email
        
  $scope.detailLink = (member) ->
    if confirm "Are you sure?"
      Member.detailLink id : member._id, (member) ->
        alert "details request link sent to " + member.email
        
.controller 'BURCtrl', ($scope, BranchRequest, toastr, $modal, Member, $rootScope, $state) ->
  if $rootScope.$user.role is 'branch_admin'
    $state.go "admin_dashboard"
  else
    $scope.perPage = 10
    $scope.currentPage = 1

    modal = null
    $scope.new_branch = null

    $scope.closeModal = ->
      modal.dismiss()

    $scope.load = (page) ->
      BranchRequest.query
        page: page
        resolved: false
        perPage: $scope.perPage
      , (requests, headers) ->
        $scope.requests = requests
        $scope.total = parseInt headers "total_found"
        $scope.pages = Math.ceil($scope.total / $scope.perPage)

    $scope.load $scope.currentPage

    $scope.pageChanged = ->
      $scope.load $scope.currentPage

    $scope.fixRecord = (record, index) ->
      $scope.selectedRecord = angular.copy record
      $scope.selectedIndex = index

      modal = $modal.open
        templateUrl: "app/manager/admin_dashboard/views/fix-record.html"
        backdrop: "static"
        scope: $scope

    $scope.submitFix = (theForm, new_branch) ->
      if theForm.$valid and confirm "Are you sure? Change to #{new_branch}?"
        Member.update
          id: $scope.selectedRecord._member._id
        , _branch: new_branch, ->
          BranchRequest.update
            id: $scope.selectedRecord._id
          , resolved: true, ->
            $scope.closeModal()

            $scope.selectedRecord = null
            $scope.selectedIndex = null
            $scope.load $scope.currentPage

    $scope.deleteRecord = (r, $index) ->
      if confirm "Are you sure?"
        BranchRequest.delete id: r._id, ->
          $scope.requests.splice $index, 1
          $scope.total -= 1

.controller 'BranchesCtrl', ($scope, Branch, $localStorage, $rootScope, $state, Auth) ->
  if $rootScope.$user.role is 'branch_admin'
    $state.go "admin_dashboard"

  else
    Auth.me (usr) ->
      if usr.superAdmin is true
        $scope.superAdmin = true

    $scope.perPage = $localStorage.branchPerPage or 15
    $scope.currentPage = 1
    $scope.branches = []

    $scope.sortType = "name"
    $scope.sortReverse = false
    $scope.searchBranch = ""

    $scope.pageSizes = [10, 15, 25, 50, 100, 200, 500]

    $scope.load = (page) ->
      Branch.query
        page: page
        perPage: $scope.perPage
      , (branches, headers) ->
        $scope.branches = branches
        $scope.total = parseInt headers "total_found"
        $scope.pages = Math.ceil($scope.total / $scope.perPage)

    $scope.load $scope.currentPage

    $scope.pageChanged = ->
      $localStorage.branchPerPage = $scope.perPage
      $scope.load $scope.currentPage

    $scope.hasSelected = ->
      $scope.branches.length and (_.filter $scope.branches, (b) -> b.selected).length > 1

    $scope.mergeSelected = ->
      newName = prompt "Please enter new name for merged branches: "
      if newName isnt null and newName.trim() isnt ""
        selectedBranches = _.pluck (_.filter $scope.branches, (b) -> b.selected), "_id"
        Branch.merge
          ids: selectedBranches
          name: newName
        , (branch) ->
          _.remove $scope.branches, (b) -> (selectedBranches.indexOf b._id) isnt -1
          $scope.branches.push branch

#Rasheed made changes to support delete
.controller 'PollsCtrl', ($scope, Auth, Poll, $modal, $timeout, toastr, $rootScope) ->
  $scope.perPage = 15
  $scope.currentPage = 1

  $scope.poll = {}
  modal = undefined

  $scope.load = (page) ->
    Auth.me (user) ->
      if user.role is "branch_admin"
        $scope._branch = user._member._branch._id
        Poll.query
          page: page
          perPage: $scope.perPage
          _branch: $scope._branch
          national: false
        , (polls, headers) ->
          $scope.polls = polls
          $scope.total = parseInt headers "total_found"
          $scope.pages = Math.ceil($scope.total / $scope.perPage)
      else
        Poll.query
          page: page
          perPage: $scope.perPage
        , (polls, headers) ->
          $scope.polls = polls
          $scope.total = parseInt headers "total_found"
          $scope.pages = Math.ceil($scope.total / $scope.perPage)

  $scope.load $scope.currentPage

  $scope.pageChanged = ->
    $scope.load $scope.currentPage

  $scope.newPoll = ->
    if $rootScope.isBranchAdmin
      $scope.poll._branch = $rootScope._branchOfAdmin._id
      $scope.poll._branchName = $rootScope._branchOfAdmin.name
      modal = $modal.open
        templateUrl: "app/manager/admin_dashboard/views/new-poll.html"
        backdrop: "static"
        scope: $scope
    else
      modal = $modal.open
        templateUrl: "app/manager/admin_dashboard/views/new-poll.html"
        backdrop: "static"
        scope: $scope

  $scope.edit = (poll) ->
    $scope.poll = poll
    modal = $modal.open
      templateUrl: "app/manager/admin_dashboard/views/new-poll.html"
      backdrop: "static"
      scope: $scope

  $scope.delete = (poll, $index) ->
    if confirm "Are you sure?"
      Poll.delete id: poll._id, ->
        $scope.polls.splice $index, 1
        $scope.total -= 1

  $scope.closeModal = ->
    $scope.poll = {}
    modal.dismiss()

  $scope.clear = -> $scope.dt = null

  $scope.toggleMin = -> $scope.minDate = $scope.minDate or new Date()
  $scope.toggleMin()

  $scope.datePicker = [
    {isOpen: false}
    {isOpen: false}
  ]

  $scope.open = (pos, $event) ->
    $event.preventDefault()
    $event.stopPropagation()

    $timeout ->
      $scope.datePicker[pos].isOpen = true
    , 50

  $scope.dateOptions =
    formatYear: 'yy'
    startingDay: 1
    class: 'datepicker'

  $scope.submit = (theForm) ->
    if theForm.$valid and ((not $scope.poll.national and $scope.poll._branch) or $scope.poll.national)
      if $scope.poll._id
        Poll.update
          id: $scope.poll._id
        , $scope.poll, (res) ->
          $scope.closeModal()
      else
        poll = new Poll $scope.poll

        poll.$save().then (p) ->
          $scope.polls.push p
          $scope.closeModal()

    else toastr.info "Please fill the form before submitting"

.controller 'AdminResultDetailsCtrl', ($scope, $stateParams, Position, Vote) ->
  Position.get id: $stateParams.id, (position) ->
    $scope.position = position

    Vote.votesForPosition id: $stateParams.id, (votes) ->
      $scope.votes = votes

      $scope.data = [[]]
      $scope.chartObject =
        type: "BarChart"
        data:
          cols: [
            {id: "t", label: "Topping", type: "string"}
            {id: "s", label: "Votes", type: "number"}
          ]
          rows: []

      _.each $scope.position.candidates, (c) ->
        $scope.chartObject.data.rows.push
          c: [
            {v: c._member.surname}
            {v: $scope.getVotes c._member._id}
          ]
      #        $scope.data[0].push $scope.getVotes c._member._id
      #        c.code

      $scope.chartObject.options =
        title: $scope.position.name


  $scope.getVotes = (id) ->
    (_.filter $scope.votes, (v) ->
      v.candidate is id ).length

.controller 'PollSettingsCtrl', ($scope, Setting, toastr) ->
  $scope.settings = []

  Setting.query {}
  .$promise.then (settings) ->
    _.each settings, (s, i) ->
      if s.type is 'datetime-local'
        settings[i].value = new Date s.value

    $scope.settings = settings

  $scope.submit = (form) ->
    if form.$valid
      jobs = []
      _.each $scope.settings, (s) ->
        jobs.push (cb) ->
          Setting.update id: s._id, s, ->
            cb()

      async.parallel jobs, (err, results) ->
        toastr.success "Settings Updated Successfully"
    else toastr.error "Please fill the form appropriately"

.controller 'PasswordCtrl', ($scope, Auth, toastr) ->
  Auth.me (user) ->
    $scope.u = angular.copy user

    #TODO: Validate Current Password
    $scope.changePassword = (theForm) ->
      if theForm.$valid
        $scope.submitting = true
        $scope.formError = null
        $scope.formSuccess = null

        Auth.changePassword $scope.u, (response) ->
          $scope.submitting = false
          toastr.success response.message

          $scope.u = angular.copy user
          $scope.password_cnf = null
          theForm.$setPristine()

        , (e) ->
          $scope.submitting = false
          $scope.formError = e.data.message
          toastr.error e.data.message
      else
        $scope.formError = "All fields are required"
