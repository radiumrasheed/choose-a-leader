'use strict'

angular.module 'elektorApp'
.controller 'PreSetupCtrl', ($scope, toastr,$http, Utils, $state, $stateParams, Member, Person, $auth, $modal, $log) ->
  $auth.logout()

  $scope.done = false

  Member.me  _member: $stateParams.id, (member) ->
    $scope.member = member

  $scope.person = {}

  $scope.submit = (theForm) ->
    if theForm.$valids
      $scope.submitting = true
      $scope.person.branch = $scope.member._branch.name
#      $scope.person.fullname = $scope.member.surname+' '+$scope.member.firstName
      console.log $scope.person

      person = new Person $scope.person
      person.$save().then (p) ->
        console.log p
      $scope.submitting = false
      $scope.done = true
      toastr.success "Update Successful"
      , (e)  ->
        $scope.submitting = false
        toastr.error e.data.message
    else
      toastr.error "Please fill the form appropriately before submitting"

  $scope.$on 'eventName', (event, data) ->
    console.log data
    $scope.person.sc_number = data.sc_number;

  $scope.showModal = ->
    if $scope.person.surname.length >=3 and $scope.person.firstName.length >= 3
        $scope.doLookup()
        .then( (result) ->
          $scope.open($scope.memberss)
          )



  $scope.doLookup = ->
    return $http.post('/api/members/getmember', $scope.person).success (members) ->
              $scope.memberss = []
              if members
                $scope.memberss.push.apply $scope.memberss, members
              return



#modal instance for members
  $scope.open = (bio) ->
    modalInstance = $modal.open(
      animation: $scope.animationsEnabled
      templateUrl: 'bioModalContent.html'
      controller: 'ModalInstanceCtrl'
      size: 'lg'
      backdrop: 'static'
      keyboard: false
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

.controller 'ModalInstanceCtrl', ($scope, $modalInstance, bio,$rootScope) ->
  $scope.bio = bio

  $scope.member = {}
  $scope.user = {}


  $scope.setData = ->
    $scope.user.name = $scope.member.data.surname+' '+$scope.member.data.firstName
    $scope.user.sc_number = $scope.member.data.sc_number
    $rootScope.$broadcast 'eventName', $scope.user
    console.log $scope.user
    $scope.cancel()


  $scope.cancel = ->
    $modalInstance.dismiss 'cancel'
