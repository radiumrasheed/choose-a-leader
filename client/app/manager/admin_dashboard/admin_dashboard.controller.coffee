'use strict'


angular.module 'elektorApp'
.controller 'AdminDashboardCtrl', ($scope, $rootScope, Auth, $state, Member) ->
  Auth.me (usr) ->
    $scope.nohint = true
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
          $scope.vmembers = members
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
          $scope.vmembers = members
          $scope.totalVerified = parseInt headers "total_found"
          $scope.ready = true

      Member.stats (stats) ->
        $scope.stats = stats

    else
      $state.go "dashboard"

.controller 'PositionsCtrl', ($scope, Position, toastr, $stateParams, Poll, Auth, $state) ->
  Auth.me (usr) ->
    if usr.username.substring(0,9) is 'nba_admin'
      toastr.error "NO ACCESS"
      $state.go "admin_dashboard"

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

.controller 'ResultsCtrl', ($scope, Vote, $timeout, $rootScope, Setting, toastr, $stateParams, Poll, Member, $modal, Branch, $state, Auth) ->
  Auth.me (usr) ->
    if usr.username.substring(0,9) is 'nba_admin'
      toastr.error "NO ACCESS"
      $state.go "admin_dashboard"

    $scope.sortType = "_id.index"

    pollId = $stateParams.id

    Poll.positionsDetailed id : pollId, (positions)  ->
      $scope.positions = positions
      $scope.standings()

    $scope.PrintElem = (elem) ->
      $scope.Popup $(elem).html()
      return

    $scope.Popup = (data) ->
      mywindow = window.open('', 'results', '')
      mywindow.document.write '<html><head><title>Results</title>'

      ###optional stylesheet###

      mywindow.document.write('<link rel="stylesheet" href="../../../app/app.css" type="text/css" />');
      mywindow.document.write '</head><body>'
      mywindow.document.write data
      mywindow.document.write '</body></html>'
      mywindow.document.close()
      # necessary for IE >= 10
      mywindow.focus()
      # necessary for IE >= 10
      $timeout ->
        mywindow.print()
        mywindow.close()
        true
      , 300

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
            voteResult = _.find position.votes, (v) -> v.candidate._id is c._member
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

      doc = new jsPDF()

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

.controller 'CandidatesCtrl', ($scope, $stateParams, Position, Candidate, toastr, Member, Upload, cloudinary, $state, Auth) ->
  Auth.me (usr) ->
    if usr.username.substring(0,9) is 'nba_admin'
      toastr.error "NO ACCESS"
      $state.go "admin_dashboard"

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

.controller 'MembersCtrl', ($scope, Member, $modal, toastr, $localStorage, Auth, $state) ->
  Auth.me (usr) ->
    if usr.username.substring(0,9) is 'nba_admin'
      toastr.error "NO ACCESS"
      $state.go "admin_dashboard"

    if usr.superAdmin is true
      $scope.superAdmin = true

    if usr.canEdit
      $scope.canEdit = true

    if usr.canDelete
      $scope.canDelete = true

    $scope.sortType = "surname"
    $scope.sortReverse = false
    $scope.searchMembers = ""
    modal = null
    $scope.perPage = $localStorage.memberPerPage or 15
    $scope.currentPage = 1
    $scope.members = []
    $scope.pageSizes = [10, 15, 25, 50, 100, 200, 500]


    $scope.load = (page) ->
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

      if $scope.superAdmin is true  && $scope.canEdit is true
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

    $scope.saveNewMember = (form) ->
      Member.createNewMember $scope.member, (m) ->
        toastr.success "New Member Data Updated"
        $scope.closeModal()

    $scope.verify = (member) ->
      if confirm "Are you sure?"
        Member.update
          id: member._id
        , verified: 1, ->
          member.verified = 1

.controller 'VerifiedRegisterCtrl', ($scope, Member, $localStorage, Auth, toastr, $state) ->
  Auth.me (usr) ->
    if usr.username.substring(0,9) is 'nba_admin'
      toastr.error "NO ACCESS"
      $state.go "admin_dashboard"

    $scope.sortType = "surname"
    $scope.sortReverse = false
    $scope.searchVerifiedRegister = ""
    $scope.perPage = $localStorage.verifiedRegisterPerPage or 15
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
      $localStorage.verifiedRegisterPerPage = $scope.perPage
      $scope.load $scope.currentPage

    $scope.sendLink = (member) ->
      if confirm "Are you sure"
        Member.createLink id : member._id, (response) ->
           alert "setup link sent to " + response.email

    $scope.detailLink = (member) ->
      if confirm "Are you sure?"
        Member.detailLink id : member._id, (member) ->
          alert "details request link sent to " + member.email

.controller 'BURCtrl', ($scope, BranchRequest, toastr, $modal, Member, $rootScope, $state, Auth) ->
  Auth.me (usr) ->
    if usr.username.substring(0,9) is 'nba_admin'
      toastr.error "NO ACCESS"
      $state.go "admin_dashboard"

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

.controller 'BranchesCtrl', ($scope, Branch, $localStorage, $rootScope, $state, Auth, toastr) ->
  if $rootScope.$user.role is 'branch_admin'
    $state.go "admin_dashboard"

  else
    Auth.me (usr) ->
      console.info usr.username.substring(0, 8)
      if usr.username.substring(0,9) is 'nba_admin'
        toastr.error "NO ACCESS"
        $state.go "admin_dashboard"

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

.controller 'PollsCtrl', ($scope, Auth, Poll, $modal, $timeout, toastr, $rootScope, $state) ->
  Auth.me (usr) ->
    if usr.username.substring(0,9) is 'nba_admin'
      toastr.error "NO ACCESS"
      $state.go "admin_dashboard"

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

.controller 'AdminResultDetailsCtrl', ($scope, $stateParams, Position, Vote, $state, Auth, toastr) ->
  Auth.me (usr) ->
    if usr.username.substring(0,9) is 'nba_admin'
      toastr.error "NO ACCESS"
      $state.go "admin_dashboard"

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

.controller 'PollSettingsCtrl', ($scope, Setting, toastr, $state) ->
  Auth.me (usr) ->
    if usr.username.substring(0,9) is 'nba_admin'
      toastr.error "NO ACCESS"
      $state.go "admin_dashboard"

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

.controller 'PasswordCtrl', ($scope, Auth, toastr, $state) ->
  Auth.me (usr) ->
#    if usr.username.substring(0,9) is 'nba_admin'
#      toastr.error "NO ACCESS"
#      $state.go "admin_dashboard"

    $scope.u = angular.copy usr

    #TODO: Validate Current Password
    $scope.changePassword = (theForm) ->
      if theForm.$valid
        $scope.submitting = true
        $scope.formError = null
        $scope.formSuccess = null

        Auth.changePassword $scope.u, (response) ->
          $scope.submitting = false
          toastr.success response.message

          $scope.u = angular.copy usr
          $scope.password_cnf = null
          theForm.$setPristine()
          $state.go "admin_dashboard"

        , (e) ->
          $scope.submitting = false
          $scope.formError = e.data.message
          toastr.error e.data.message
      else
        $scope.formError = "All fields are required"

.controller 'VotersRegisterCtrl', ($scope, VotersRegister, Auth, $localStorage, $state, toastr, $modal) ->
  Auth.me (usr) ->
    if usr.superAdmin is true

      if usr.canEdit
        $scope.canEdit = true

      if usr.canDelete
        $scope.canDelete = true

      modal = null
      $scope.sortType = "fullname"
      $scope.sortReverse = false
      $scope.searchVotersRegister = ""
      $scope.perPage = $localStorage.votersRegisterPerPage or 15
      $scope.currentPage = 1
      $scope.pageSizes = [10, 15, 25, 50, 100, 200, 500]
      $scope.superAdmin = true

      VotersRegister.branches (data) ->
        $scope.branchData = data

      $scope.getConfirmed = ->
        $scope.getConfirmedMembers = !$scope.getConfirmedMembers
        $scope.pageChanged()

      $scope.getUpdated = ->
        $scope.getUpdatedMembers = !$scope.getUpdatedMembers
        $scope.pageChanged()

      $scope.load = (page) ->
        if $scope.searchVotersRegister is ''
          VotersRegister.branchMembers
            confirm: $scope.getConfirmedMembers
            updated: $scope.getUpdatedMembers
            deleted: false
            page: page
            branchCode: $scope.selectedItem
            perPage: $scope.perPage
          , (voters_register, headers) ->
            if voters_register?
              $scope.voters_register = voters_register
              $scope.searchHeader = false
              deleted: false
              $scope.total = parseInt headers "total_found"
              $scope.pages = Math.ceil($scope.total / $scope.perPage)
        else
          VotersRegister.branchMembers
            confirm: $scope.getConfirmedMembers
            updated: $scope.getUpdatedMembers
            deleted: false
            page: page
            branchCode: $scope.selectedItem
            perPage: $scope.perPage
            search: $scope.searchVotersRegister
          , (voters_register, headers) ->
            if voters_register?
              $scope.searchHeader = true
              $scope.voters_register = voters_register
              $scope.total = parseInt headers "total_found"
              $scope.pages = Math.ceil($scope.total / $scope.perPage)

      $scope.checkName = ->
        VotersRegister.checkVotersName $scope.member, (result) ->
          if result.length > 0
            alert 'similar name already exists'
            $scope.exists = true
            $scope.member = {}
          else
            $scope.exists = false
            $scope.good = true

#      $scope.load $scope.currentPage

      $scope.resetAll = ->
        $scope.selectedItem = ''
        $scope.voters_register = null
        $scope.searchVotersRegister = ''
        $scope.total = 0
        $scope.getUpdatedMembers = false
        $scope.getConfirmedMembers = false

      $scope.resetAll()

      $scope.pageChanged = ->
        $localStorage.votersRegisterPerPage = $scope.perPage
        $scope.load $scope.currentPage

      $scope.hasSelected = ->
        if $scope.voters_register?
          $scope.voters_register.length and (_.filter $scope.voters_register, (v) -> v.selected).length >= 1

      $scope.deleteSelected = ->
        admin_username = prompt "Please enter your Username: "
        if admin_username.toLowerCase() is usr.username.toLowerCase()
          selectedVoters = _.pluck (_.filter $scope.voters_register, (v) -> v.selected), "_id"
          VotersRegister.removeVoters ids: selectedVoters, (response) ->
            _.remove $scope.voters_register, (v) -> (selectedVoters.indexOf v._id) isnt -1
            alert selectedVoters.length + ' Voters successfully deleted'

        else
          alert "I hope you know what you are doing!"

      $scope.addMemberVR = ->
        $scope.member = {}
        modal = $modal.open
          templateUrl: "app/manager/admin_dashboard/views/new-voters-register-form.html"
          scope: $scope
          backdrop: 'static'

      $scope.editMemberVR = (member) ->
        if member.prevDataModified?
          delete member.prevDataModified
        $scope.selectedMember = member

        modal = $modal.open
          templateUrl: "app/manager/admin_dashboard/views/voters-register-form.html"
          scope: $scope
          backdrop: 'static'

      $scope.closeModal = ->
        $scope.selectedMember = null
        $scope.exists = null
        $scope.good = null
        modal.dismiss()

      $scope.updateMemberVR = ->
        if $scope.selectedMember.mobileNumber is ''
          $scope.selectedMember.mobileNumber = 'INVALID MOBILE'
        if $scope.selectedMember.email is ''
          $scope.selectedMember.email = 'NOT AVAILABLE'
        $scope.selectedMember.prevModifiedBy = usr.username
        $scope.selectedMember.prevModifiedDate = new Date

        VotersRegister.saveData id: $scope.selectedMember._id, $scope.selectedMember, ->
          toastr.success "Member Data Updated"
          $scope.closeModal()

      $scope.saveNewMemberVR = (form) ->
        if $scope.exists is true
          toastr.error "Member exists"
        else
          $scope.member.fullname = $scope.member.surname + ' ' + $scope.member.firstName
          if $scope.member.mobileNumber is '' || not $scope.member.mobileNumber?
            $scope.member.mobileNumber = 'INVALID MOBILE'
          if $scope.member.email is '' || not $scope.member.email?
            $scope.member.email = 'NOT AVAILABLE'
          if $scope.member.scNumber is '' || not $scope.member.scNumber?
            $scope.member.scNumber = 'NE'
          $scope.member.createdBy = usr.username
          $scope.member.createdDate = new Date
          delete $scope.member.firstName
          delete $scope.member.surname
          VotersRegister.create $scope.member, (m) ->
            toastr.success "New Member Data Created"
            $scope.closeModal()

    else
      $state.go "admin_dashboard"

.controller 'SupportCtrl', ($state, $scope, Auth, Enquiry) ->
  Auth.me (usr) ->
    if usr.superAdmin is true
      $scope.currentPage = 1
      $scope.active1 = true
      $scope.active2 = false


      $scope.getAllUnresolved = ->
        Enquiry.getAllUnresolved (enquiries)->
          $scope.unResolvedEnquiries = enquiries
          $scope.perPage1 = enquiries.length


      $scope.getAllResolved = ->
        Enquiry.getAllResolved (enquiry)->
          $scope.resolvedEnquiries = enquiry
          $scope.perPage2 = enquiry.length

      $scope.addEnquiry = ->
        $state.go "enquiry"

      $scope.getAllUnresolved()
      $scope.getAllResolved()
      $scope.resolve = (e,index) ->
        console.log e[index]
        e[index].resolved = true
        Enquiry.resolve e[index], (resp)->
          if resp.resolved is true
            $scope.getAllUnresolved()
            $scope.getAllResolved()
            toastr.success "Enquiries resolved Successful"
        , (e)  ->
            e[index].resolved = false
            toastr.error e.data.message

    else
      $state.go "admin_dashboard"

.controller 'NameFixCtrl', ($scope, VotersRegister,Member,Auth, $localStorage, $state, toastr, $modal) ->
  Auth.me (usr) ->
    if usr.superAdmin is true
      $scope.canEdit = true

      modal = null
      $scope.sortType = "fullname"
      $scope.sortReverse = false
      $scope.searchVotersRegister = ""
      $scope.perPage = $localStorage.votersRegisterPerPage or 15
      $scope.currentPage = 1
      $scope.pageSizes = [10, 15, 25, 50, 100, 200, 500]
      $scope.superAdmin = true

      VotersRegister.branches (data) ->
        $scope.branchData = data


      $scope.load = (page) ->
          VotersRegister.branchMembers
            updated: true
            deleted: false
            page: page
            branchCode: $scope.selectedItem
            perPage: $scope.perPage
          , (voters_register, headers) ->
            if voters_register?
              $scope.searchHeader = true
              $scope.voters_register = voters_register
              $scope.total = parseInt headers "total_found"
              $scope.pages = Math.ceil($scope.total / $scope.perPage)

      $scope.pageChanged = ->
        $localStorage.votersRegisterPerPage = $scope.perPage
        $scope.load $scope.currentPage

      $scope.editMember =(member) ->
        $scope.selectedMember = member
        modal = $modal.open
          templateUrl: "app/manager/admin_dashboard/views/fix-name-form.html"
          scope: $scope
          backdrop: 'static'


      $scope.closeModal = ->
        $scope.selectedMember = null
        $scope.exists = null
        $scope.good = null
        modal.dismiss()

      $scope.saveEditedMemberVR = (form) ->
        $scope.selectedMember.NameFix = true
        member ={}
        member.email = $scope.selectedMember.updatedEmail
        member.sc_number = $scope.selectedMember.sc_number
        member.surname = $scope.selectedMember.updatedSurname
        VotersRegister.saveData id: $scope.selectedMember._id, $scope.selectedMember, ->
          if $scope.selectedMember.confirmed is true
            Member.updateSurname member,(m)->
              if m
                toastr.success "Member Surname Updated in Voters register and Members"
                $scope.closeModal()
          else
            toastr.success "Member Surname Updated in Voters register"
            $scope.closeModal()


    else
      $state.go "admin_dashboard"

.controller 'ConfirmRecordCtrl', ($scope, VotersRegister,Member,Auth, $localStorage, $state, toastr, $modal) ->
  Auth.me (usr) ->
    if usr.superAdmin is true
      $scope.canEdit = true

      modal = null
      $scope.sortType = "fullname"
      $scope.sortReverse = false
      $scope.searchVotersRegister = ""
      $scope.perPage = $localStorage.votersRegisterPerPage or 15
      $scope.currentPage = 1
      $scope.pageSizes = [10, 15, 25, 50, 100, 200, 500]
      $scope.superAdmin = true

      VotersRegister.branches (data) ->
        $scope.branchData = data


      $scope.load = (page) ->
        VotersRegister.branchMembers
          confirmed:false
          updated: true
          deleted: false
          page: page
          branchCode: $scope.selectedItem
          perPage: $scope.perPage
        , (voters_register, headers) ->
          if voters_register?
            $scope.searchHeader = true
            $scope.voters_register = voters_register
            $scope.total = parseInt headers "total_found"
            $scope.pages = Math.ceil($scope.total / $scope.perPage)

      $scope.pageChanged = ->
        $localStorage.votersRegisterPerPage = $scope.perPage
        $scope.load $scope.currentPage

      $scope.editMember =(member) ->
        $scope.selectedMember = member
        modal = $modal.open
          templateUrl: "app/manager/admin_dashboard/views/confirmRecord-form.html"
          scope: $scope
          backdrop: 'static'
      $scope.addMember = ->
        $scope.newMember = {}
        modal = $modal.open
          templateUrl: "app/manager/admin_dashboard/views/confirmRecord-add-form.html"
          scope: $scope
          backdrop: 'static'

      $scope.closeModal = ->
        $scope.selectedMember = null
        $scope.exists = null
        $scope.good = null
        modal.dismiss()

      $scope.saveVRMember = (form) ->
        if confirm 'Are you sure you want to submit this Data?'
          $scope.confirmed= true
          member ={}
          member.email = $scope.selectedMember.updatedEmail
          member.sc_number = $scope.selectedMember.sc_number
          member.surname = $scope.selectedMember.updatedSurname
          member.middleName = $scope.selectedMember.updatedMiddleName
          member.firstName = $scope.selectedMember.updatedFirstName
          member.phone = $scope.selectedMember.updatedPhone
          member.email = $scope.selectedMember.updatedEmail
          member.branch = $scope.selectedMember.branchCode
          member.verified = 1
          member.createdBy = usr.username
          member.confirm = true
          Member.createNewMember member,(newMember) ->
            if newMember.statusCode is 200
              $scope.selectedMember.confirmed = true
              VotersRegister.saveData $scope.selectedMember, (memb) ->
                if memb.confirmed
                  $scope.selectedMember.confirmed = memb.confirmed
                  $scope.closeModal()
                  toastr.success 'Voter was confirmed successfully'
                else toastr.error 'Voter was confirmed but not updated'
            else if newMember.statusCode is 304
              $scope.selectedMember.confirmed = false
              $scope.closeModal()
              toastr.error newMember.message
      $scope.addNewMember = (form) ->


    else
      $state.go "admin_dashboard"

.controller 'BoardCtrl', ($scope, Auth, Vote, $rootScope, $stateParams, Poll, $timeout) ->
  Auth.me (usr) ->
    Poll.positionsDetailed id : $stateParams.id, (positions)  ->
      $scope.positions = positions
      $scope.standings()

    $scope.standings = ->
      Vote.lawyerStats poll : $stateParams.id, (stats) ->
        $scope.lawyerStats = stats

        $rootScope.$broadcast "board_lawyerStats", stats
        $timeout ->
          $scope.standings()
        , 30000
      return

.controller 'UnaccreditedCtrl', ($scope, Member, Auth, $localStorage, $state, toastr, $modal) ->
  Auth.me (usr) ->
    if usr.superAdmin is true

      $scope.sortType = "fullname"
      $scope.sortReverse = false
      $scope.searchMember = ""
      $scope.perPage = $localStorage.votersRegisterPerPage or 15
      $scope.currentPage = 1
      $scope.pageSizes = [10, 15, 25, 50, 100, 200, 500]
      $scope.superAdmin = true

      Member.distinctBranch (data) ->
        $scope.branchData = data

      $scope.load = (page) ->
        if $scope.searchMember is ''
          Member.query
            page: page
            branchCode: $scope.selectedItem
            unaccredited: true
            perPage: $scope.perPage
          , (unaccredited, headers) ->
            if unaccredited?
              $scope.unaccredited = unaccredited
              $scope.searchHeader = false
              deleted: false
              $scope.total = parseInt headers "total_found"
              $scope.pages = Math.ceil($scope.total / $scope.perPage)
        else
          Member.query
            page: page
            branchCode: $scope.selectedItem
            unaccredited: true
            perPage: $scope.perPage
            name: $scope.searchMember
          , (unaccredited, headers) ->
            if unaccredited?
              $scope.searchHeader = true
              $scope.unaccredited = unaccredited
              $scope.total = parseInt headers "total_found"
              $scope.pages = Math.ceil($scope.total / $scope.perPage)

      #      $scope.load $scope.currentPage

      $scope.resetAll = ->
        $scope.selectedItem = ''
        $scope.unaccredited = null
        $scope.searchMember = ''
        $scope.total = 0
        $scope.getUpdatedMembers = false
        $scope.getConfirmedMembers = false

      $scope.resetAll()

      $scope.pageChanged = ->
        $localStorage.membersPerPage = $scope.perPage
        $scope.load $scope.currentPage

      $scope.resendLink = (member) ->
        if confirm "Resend to "+member.email+' '+member.phone
          Member.resendLink id : member._id, (response) ->
            alert "setup link sent to " + response.email

    else
      $state.go "admin_dashboard"