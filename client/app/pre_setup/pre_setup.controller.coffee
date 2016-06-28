'use strict'

angular.module 'elektorApp'
.controller 'PreSetupCtrl', ($scope, toastr, $http, Utils, $state, $stateParams, Voters_Register, Member, Person, $auth, $modal, $log) ->
  $auth.logout()

  $scope.done = false

  Voters_Register.me _id: $stateParams.id, (member) ->
    $scope.member = member

  $scope.search = {}
  #  Member.me  _member: $stateParams.id, (member) ->
  #    $scope.member = member

  $scope.person = {}

  $scope.submit = (theForm) ->
    if theForm.$valid
      $scope.submitting = true
      $scope.person._id = $scope.member._id
      $scope.person.updated = true
      $scope.person.updatedTime = moment().format('lll')
      #      $scope.person.branch = $scope.member.branchCode
      ##      $scope.person.fullname = $scope.member.surname+' '+$scope.member.firstName
      #      console.log $scope.person
      Voters_Register.saveData $scope.person, ->
        $scope.submitting = false
        $scope.done = true
        toastr.success "Update Successful"
      , (e)  ->
        $scope.submitting = false
        toastr.error e.data.message
    else
      toastr.error "Please fill the form appropriately before submitting"

  $scope.$on 'eventName', (event, data) ->
    $scope.person.sc_number = data.sc_number;

  $scope.innerSearch = ->
    $scope.search.rank = 1
    $scope.showModal()

  $scope.showModal = ->
    $scope.doLookup()
    .then((result) ->
      $scope.open($scope.memberss)
    )

  $scope.dashboard = ->
    $state.go "dashboard"

  $scope.doLookup = ->
    if not $scope.person.rank? and $scope.search.rank isnt 1
      if $scope.person.updatedSurname.length >= 3 and $scope.person.updatedFirstName.length >= 3
        return $http.post('/api/members/getmember', $scope.person).success (members) ->
          $scope.memberss = []
          if members
            $scope.memberss.push.apply $scope.memberss, members
          return
    if $scope.search.rank is 1
      if $scope.search.searchSurname.length >= 3 and $scope.search.searchFirstName.length >= 3
        return $http.post('/api/members/getmember', $scope.search).success (members) ->
          $scope.memberss = []
          if members
            $scope.memberss.push.apply $scope.memberss, members
          return
      $scope.search = 0

  #modal instance for members
  $scope.open = (bio) ->
    modalInstance = $modal.open(
      animation: $scope.animationsEnabled
      templateUrl: 'bioModalContent.html'
      controller: 'ModalInstanceCtrl'
      size: 'lg'
      backdrop: 'static'
      keyboard: false
      resolve:
        bio: ->
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

.controller 'ModalInstanceCtrl', ($scope, $modalInstance, bio, $rootScope) ->
  $scope.bio = bio

  $scope.member = {}
  $scope.user = {}


  $scope.setData = ->
    $scope.user.name = $scope.member.data.surname + ' ' + $scope.member.data.firstName
    $scope.user.sc_number = $scope.member.data.scNumber
    $rootScope.$broadcast 'eventName', $scope.user
    $scope.cancel()


  $scope.cancel = ->
    $modalInstance.dismiss 'cancel'
