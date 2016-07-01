'use strict'

angular.module 'elektorApp'
.config ($stateProvider) ->
  $stateProvider.state 'admin_dashboard',
    url: '/admin_dashboard/'
    templateUrl: 'app/manager/admin_dashboard/admin_dashboard.html'
    controller: 'AdminDashboardCtrl'

  .state 'admin_dashboard.settings',
    url: 'settings/'
    templateUrl: 'app/manager/admin_dashboard/views/settings.html'
    controller: 'PollSettingsCtrl'

  .state 'admin_dashboard.verified_register',
    url: 'verified_register/'
    templateUrl: 'app/manager/admin_dashboard/views/verified-register.html'
    controller: 'VerifiedRegisterCtrl'

  .state 'admin_dashboard.members',
    url: 'members/'
    templateUrl: 'app/manager/admin_dashboard/views/members.html'
    controller: 'MembersCtrl'

  .state 'admin_dashboard.positions',
    url: 'positions/:id/'
    templateUrl: 'app/manager/admin_dashboard/views/positions.html'
    controller: 'PositionsCtrl'

  .state 'admin_dashboard.positions.candidates',
    url: 'candidates/:position_id/'
    templateUrl: 'app/manager/admin_dashboard/views/candidates.html'
    controller: 'CandidatesCtrl'

  .state 'admin_dashboard.results',
    url: 'results/:id/'
    templateUrl: 'app/manager/admin_dashboard/views/results.html'
    controller: 'ResultsCtrl'

  .state 'admin_dashboard.results.details',
    url: ':id/candidates/'
    templateUrl: 'app/manager/admin_dashboard/views/poll-details.html'
    controller: 'ResultDetailsCtrl'

  .state 'admin_dashboard.branches',
    url: 'branches/'
    templateUrl: 'app/manager/admin_dashboard/views/branches.html'
    controller: 'BranchesCtrl'

  .state 'admin_dashboard.polls',
    url: 'polls/'
    templateUrl: 'app/manager/admin_dashboard/views/polls.html'
    controller: 'PollsCtrl'

  .state 'admin_dashboard.branch_requests',
    url: 'branch_updates/'
    templateUrl: 'app/manager/admin_dashboard/views/branch-updates.html'
    controller: 'BURCtrl'
    
  .state 'admin_dashboard.update_admin_password',
    url: 'update_password/'
    templateUrl: 'app/manager/admin_dashboard/views/update-password.html'
    controller: 'PasswordCtrl'

  .state 'admin_dashboard.voters_register',
    url: 'voters_register/'
    templateUrl: 'app/manager/admin_dashboard/views/voters-register.html'
    controller: 'VotersRegisterCtrl'