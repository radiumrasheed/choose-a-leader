'use strict'

angular.module 'elektorApp', [
  'ngCookies'
  'ngResource'
  'ngSanitize'
  'ui.router'
  'ngStorage'
  'ui.bootstrap'
  'toastr'
  'satellizer'
  'naif.base64'
  'ui.utils.masks'
  'angular-loading-bar'
  'cloudinary'
  'ngFileUpload'
  "googlechart"
  "dibari.angular-ellipsis"
]

.run ($auth, $rootScope, $window, Utils, Auth) ->
  $rootScope.cl = cloudinary.Cloudinary.new()
  $rootScope.cl.fromEnvironment()

  $rootScope.$auth = $auth

  $rootScope.$user = $auth.getPayload()

  $rootScope.formatMoney = (m) ->
    parseInt(m).formatMoney 2

  $rootScope.ago = (dt) ->
    moment(dt).fromNow()

  $rootScope.$on '$stateChangeStart', (event, next) ->
    if not $auth.isAuthenticated() and not next.guestView then $window.location.href = '/login/'
    if $auth.isAuthenticated() && $auth.getPayload().role is 'member'
      if next.name isnt "change_password"
        Auth.me (user) ->
          $rootScope.$user = user
          Utils.userIsSetup user

.factory 'Utils', ($state, $auth, $sessionStorage) ->
  userIsSetup: (user) ->
    if user._member._branch is undefined or user._member._branch is null
      $auth.logout()
      $sessionStorage.tempMember = user._member
      $state.go "branch_request", id: user._member._id
    else if user._member.verified isnt 1
      $auth.logout()
      $state.go "unconfirmed"
    else if user._member.email is "" or user._member.email is undefined or not user._member.codeConfirmed then $state.go "setup_account"

.config ( $stateProvider, $urlRouterProvider, $locationProvider, $authProvider, $httpProvider, cloudinaryProvider ) ->
  $httpProvider.interceptors.push("requestInterceptor")

  cloudinaryProvider.set "cloud_name", "elektor"
  cloudinaryProvider.set "upload_preset", "hqcz8utg"

  $authProvider.logoutRedirect = '/login/'
  $authProvider.loginOnSignup = false
  $authProvider.signupRedirect = false
  $authProvider.loginUrl = '/auth/login'
  $authProvider.signupUrl = '/auth/create'
  $authProvider.loginRoute = '/login/'

  $authProvider.tokenPrefix = '__nba-elektor__'

  $authProvider.platform = 'browser'
  $authProvider.storage = 'sessionStorage'

  $urlRouterProvider
  .otherwise '/'

  $locationProvider.html5Mode true

`Number.prototype.formatMoney = function(c, d, t){
    var n = this,
        s = n < 0 ? '-' : '';

    c = isNaN(c = Math.abs(c)) ? 2 : c;
    d = d === undefined ? '.' : d;
    t = t === undefined ? ',' : t;

    var i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + '',
        j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : '');
}`
