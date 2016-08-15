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
    nativeTransitions: {
      "type": "flip",
      "direction": "left"
    },
    controller: 'homeScreenCtrl'
  })

  .state('signup', {
    url: '/signup',
    templateUrl: 'templates/signup.html',
    nativeTransitions: {
      "type": "flip",
      "direction": "left"
    },
    controller: 'signupCtrl'
  })

  .state('joinQueue', {
    url: '/joinQueue',
    templateUrl: 'templates/joinQueue.html',
    nativeTransitions: {
      "type": "flip",
      "direction": "left"
    },
    controller: 'joinQueueCtrl'
  })

  .state('welcomeToTheQueue', {
    url: '/queue',
    templateUrl: 'templates/welcomeToTheQueue.html',
    nativeTransitions: {
      "type": "flip",
      "direction": "left"
    },
    controller: 'queueCtrl'
  })

  .state('canYouPleaseRateTheService', {
    url: '/rate',
    templateUrl: 'templates/canYouPleaseRateTheService.html',
    nativeTransitions: {
      "type": "flip",
      "direction": "left"
    },
    controller: 'rateServiceCtrl'
  })

  .state('termsOfUse', {
    url: '/terms',
    templateUrl: 'templates/termsOfUse.html',
    nativeTransitions: {
      "type": "flip",
      "direction": "left"
    },
    controller: 'termsOfUseCtrl'
  })

  $urlRouterProvider.otherwise('/home')

});
