'use strict'

angular.module 'elektorApp'
.controller 'RegisterCtrl', ($scope, VotersRegister, $window, $localStorage) ->
  VotersRegister.branches (data)->
    $scope.branchData = data

#  $scope.sortType = "surname"
#  $scope.sortReverse = false
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
        branchCode: $scope.selectedItem
        , (members, headers) ->
            $scope.members = members
            if !members.length
              $scope.noData = true
            $scope.searchHeader = false
            $scope.total = parseInt headers "total_found"
            $scope.pages = Math.ceil($scope.total / $scope.perPage)
    else
      VotersRegister.searchDetails
        page: page
        perPage: $scope.perPage
        branchCode: $scope.selectedItem
        search: $scope.searchMembers
        unconfirmedVoter: true
      , (members, headers) ->
          $scope.members = members
          $scope.total = parseInt headers "total_found"
          $scope.searchHeader = true
          $scope.pages = Math.ceil($scope.total / $scope.perPage)

  $scope.load $scope.currentPage

  $scope.pageChanged = ->
    $localStorage.memberPerPage = $scope.perPage
    $scope.load $scope.currentPage

  $scope.update = (id) ->
    $window.location.href = '/pre_setup/'+id+'/'
