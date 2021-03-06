'use strict'

angular.module 'elektorApp'
.controller 'ConfirmRegisterCtrl', ($scope, $state, Auth, VotersRegister, toastr, Member, $window, $localStorage) ->
  Auth.me (usr) ->
    if usr.role is 'admin' and usr.superAdmin is true
      VotersRegister.getUpdate (data)->
        $scope.updatedBranches = data.data
        $scope.branchSize = data.size
      VotersRegister.branches  (data)->
        $scope.branchData = data

      $scope.searchMembers = ""
      $scope.perPage = $localStorage.memberPerPage or 15
      $scope.currentPage = 1
      $scope.members = []
      $scope.pageSizes = [10, 15, 25, 50, 100, 200, 500]


      $scope.load = (page) ->
        if $scope.searchMembers is ''
          VotersRegister.branchDetails
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
        user.middleName = data.updatedMiddleName
        user.surname = data.updatedSurname
        user.sc_number = data.sc_number
        user.phone = data.updatedPhone
        user.email = data.updatedEmail
        user.verified = 1
        user.branch = data.branchCode
        user.confirm = true

        Member.createNewMember user,(newMember) ->
          console.log newMember
          if newMember.statusCode is 200
            data.confirmed = true
            VotersRegister.saveData data, (memb) ->
              if memb.confirmed
                $scope.members[index].confirmed = memb.confirmed
                toastr.success 'Voter was confirmed successfully'
              else toastr.error 'Voter was confirmed but not updated'
          else if newMember.statusCode is 304
            data.confirmed = false
            toastr.error newMember.message

    else $state.go "dashboard"
