angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider



      .state('homeScreen', {
    url: '/home',
    templateUrl: 'templates/homeScreen.html',
    controller: 'homeScreenCtrl'
  })

  .state('signup', {
    url: '/signup',
    templateUrl: 'templates/signup.html',
    controller: 'signupCtrl'
  })

  .state('scanQRCode', {
    url: '/scanqr',
    templateUrl: 'templates/scanQRCode.html',
    controller: 'scanQRCodeCtrl'
  })

  .state('welcomeToTheQueue', {
    url: '/queue',
    templateUrl: 'templates/welcomeToTheQueue.html',
    controller: 'queueCtrl'
  })

  .state('canYouPleaseRateTheService', {
    url: '/rate',
    templateUrl: 'templates/canYouPleaseRateTheService.html',
    controller: 'rateServiceCtrl'
  })

  .state('termsOfUse', {
    url: '/terms',
    templateUrl: 'templates/termsOfUse.html',
    controller: 'termsOfUseCtrl'
  })

  $urlRouterProvider.otherwise('/home')

});
