'use strict'

angular.module 'elektorApp'
.controller 'ConfirmRegisterCtrl', ($scope,Voters_Register,toastr,Member,$window, $localStorage) ->
  Voters_Register.branches  (data)->
    $scope.branchData = data

  $scope.searchMembers = ""
  $scope.perPage = $localStorage.memberPerPage or 15
  $scope.currentPage = 1
  $scope.members = []
  $scope.pageSizes = [10, 15, 25, 50, 100, 200, 500]


  $scope.load = (page) ->
    if $scope.searchMembers is ''
      Voters_Register.branchDetails
        page: page
        perPage: $scope.perPage
        confirm: true
        branchCode: $scope.selectedItem
        , (members, headers) ->
            $scope.members = members
            if !members.length
              $scope.noData = true
            $scope.searchHeader = false
            $scope.total = parseInt headers "total_found"
            $scope.pages = Math.ceil($scope.total / $scope.perPage)

  $scope.load $scope.currentPage

  $scope.pageChanged = ->
    $localStorage.memberPerPage = $scope.perPage
    $scope.load $scope.currentPage

  $scope.update = (data,index) ->
    user = {}
    user.firstName = data.updatedFirstName
    user.middlename = data.updatedMiddleName
    user.surname = data.updatedSurname
    user.sc_number = data.updatedsc_number
    user.phone = data.updatedPhone
    user.email = data.updatedEmail
    user.verified = 1
    user.branch = data.branchCode
    Member.createNewMember user,(newMember) ->
      if newMember
        data.confirmed = true
        Voters_Register.saveData data, (memb) ->
          if memb.confirmed
            $scope.members[index].confirmed = memb.confirmed
            toastr.success 'Voter was confirmed successfully'
          else toastr.error 'Voter was confirmed but not updated'
      else toastr.error 'Voter was not Confirmed'

