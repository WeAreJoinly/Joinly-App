angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider



      .state('homeScreen', {
    url: '/homeScreen',
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

  .state('signin', {
    url: '/signin',
    templateUrl: 'templates/signin.html',
    nativeTransitions: {
      "type": "flip",
      "direction": "left"
    },
    controller: 'signinCtrl'
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

  .state('inQueue', {
    url: '/inQueue',
    templateUrl: 'templates/inQueue.html',
    nativeTransitions: {
      "type": "flip",
      "direction": "left"
    },
    controller: 'queueCtrl'
  })

  .state('rateService', {
    url: '/rate',
    templateUrl: 'templates/rateService.html',
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
  });
  
  $urlRouterProvider.otherwise('/signin')

});
