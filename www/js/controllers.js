angular.module('app.controllers', [])

.controller('homeScreenCtrl', function($scope, $state) {
  //Init socket.io
  var socket = io('http://joinly.org/');
  socket.on('connect', function(){
    console.log('socket.io connection in homeScreenCtrl');
  });
})

.controller('signinCtrl', function($scope, $state, $ionicPopup, $cordovaOauth){

  var user = firebase.auth().currentUser;
  if (user) {
    // User is signed in already.
    console.log('User already in with user id ' + user.uid);
    var uid = user.uid;
    database.ref('user/' + uid).on('value', function(snapshot) {
      var user = snapshot.val();
      if(user != null && user.ongoingQueue == true){
        //User has on going queue
        //Go to queue screen
        $state.go('inQueue');
      }else{
        $state.go('homeScreen');
      }
    });
  }

  $scope.userData = {};
  var userData = $scope.userData;
  $scope.signInBtn = function(){
    if(userData.email != null && userData.email != ''){
      if(userData.password != null && userData.password != ''){
        firebase.auth().signInWithEmailAndPassword(userData.email, userData.password).catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
        });
        console.log(userData.email + " : " + userData.password);
        loginProcessCallback();
      }
    }
  }
  $scope.facebookSignInBtn = function(){
    signInWithFacebook();
  }
  function signInWithFacebook(){
    //TODO
    var accessRequestFacebook = [
      "email",
      "public_profile",
      "user_friends",
      "user_about_me",
      "user_relationships",
      "user_birthday",
      "user_relationship_details",
      "user_hometown",
      "user_likes",
      "user_religion_politics",
      "user_location",
      "user_education_history"
    ];
    $cordovaOauth.facebook("483531465189283", accessRequestFacebook).then(function(result) {
        // results
        var facebookAccessToken = result.access_token;
        var FBCredential = firebase.auth.FacebookAuthProvider.credential(facebookAccessToken);
        // Sign in with the credential from the Facebook user.
        firebase.auth().signInWithCredential(FBCredential).catch(function(error) {
          console.error(error);
        });
        loginProcessCallback();
    }, function(error) {
        // error
        console.error(error);
        $ionicPopup.alert({
          title: "Error",
          template: "Failed to login with Facebook"
        });
    });
  } //--> End of signInWithFacebook()

  function loginProcessCallback(){
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        $state.go('homeScreen');
      } else {
        // User is signed out.
        $ionicPopup.alert({title: "Error",template: "Wrong email, password or application failed during login process"});
      }
    });
  }
})

.controller('signupCtrl', function($scope, $state, $ionicPopup) {
  $scope.userData = {};
  var userData = $scope.userData;

  $scope.signUpBtn = function(){
    //Validate data
    var dataFilled = true;
    if(userData.name == null || userData.name.length < 2){
      dataFilled = false;
    }
    if(userData.phone == null || userData.phone.length < 6 || userData.phone.length > 20){
      dataFilled = false;
    }
    if(userData.email == null || userData.email.length < 4){
      dataFilled = false;
    }
    if(userData.city == null || userData.city.length < 2){
      dataFilled = false;
    }
    if(userData.address == null || userData.address.length < 2){
      dataFilled = false;
    }
    if(userData.zip == null || userData.zip.length < 4){
      dataFilled = false;
    }
    if(userData.state == null || userData.state.length < 2){
      dataFilled = false;
    }
    if(dataFilled){
      //Sign up with email in firebase
      firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
      });
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          // User is signed in.
          //Copy old data
          database.ref('user/'+uid).on('value', function(snapshot) {
            var oldUserData = snapshot.val();
            //Insert new data
            database.ref('user/'+uid).set({
              name: dataFilled.name,
              email: dataFilled.email,
              phone: dataFilled.phone,
              city: dataFilled.city,
              address: dataFilled.address,
              zip: dataFilled.zip,
              state: dataFilled.state,
              ongoingQueue: oldUserData.ongoingQueue
            });

            $state.go('homeScreen');

          });
        } else {
          // User is signed out.
          $ionicPopup.alert({title: "Error",template: "Application failed during sign up process"});
        }
      });
    }else{
      $ionicPopup.alert({
          title: 'Error',
          template: 'Fill all empty fields and make sure data you enter is legit and correct!'
      });
    }
  }
})

.controller('joinQueueCtrl', function($scope, $state, $cordovaBarcodeScanner, $ionicPopup, $cordovaGeolocation, $cordovaProgress) {

  $cordovaProgress.showSimple(true, "Loading...");

  function setUpMap(){
    var posOptions = {timeout: 10000, enableHighAccuracy: false};
    $cordovaGeolocation
      .getCurrentPosition(posOptions)
      .then(function (position) {
        var lat  = position.coords.latitude
        var long = position.coords.longitude

        var myCenter = {lat: lat, lng: long};

        var map = new google.maps.Map(document.getElementById('map'), {
          center: myCenter,
          scrollwheel: true,
          zoom: 11
        });

        var marker=new google.maps.Marker({
          position:myCenter,
        });

        marker.setMap(map);

        //TODO load all queues from database
        //TODO load queues as pins to the map

        $cordovaProgress.hide()

      }, function(err) {
        // error
        $cordovaProgress.hide();
        console.error(err);
        $ionicPopup.alert({
            title: 'Error',
            template: "Error getting user's geolocation"
        });
      });
  }

  var uid = firebase.auth().currentUser.uid;

  $scope.inputData = {};
  var inputData = $scope.inputData;

  $scope.scanBarcode = function() {
       $cordovaBarcodeScanner.scan().then(function(imageData) {
           //process the result
           var queueId = imageData.text;
           console.log(queueId);
           if (imageData.text != "" && !imageData.cancelled) {
             ContinueToQueue(queueId);
           }
           console.log("Barcode Format -> " + imageData.format);
           console.log("Cancelled -> " + imageData.cancelled);
       }, function(error) {
           console.log("An error happened -> " + error);
       });
   }
   $scope.enterIdBtn = function(){
     var enterId = inputData.enterId;
     database.ref('shortcut/' + enterId).on('value', function(snapshot) {
       var queue = snapshot.val();
       if(queue != null){
         console.log(queue);
         ContinueToQueue(queue);
       }else{
         //This queue does not exist
         $ionicPopup.alert({
             title: 'Error',
             template: 'This queue does not exist'
         });
       }
     });
   }

   function ContinueToQueue(queueId){
     database.ref('queue/' + queueId + '/queue').on('value', function(snapshot) {
       var queue = snapshot.val();
       if(queue != null){
         //Get your place in the queue
         var placeInQueue = Object.keys(queue).length - 1;
         //Update queue in the database
         console.log("Your place in queue is number " + placeInQueue);
         var newQueue = queue;
         var newData = {};
         newQueue[uid] = placeInQueue;

         database.ref('queue/' + queueId + '/queue').set(newQueue);
         database.ref('user/' + uid + '/ongoingQueue').set(queueId);
         database.ref('user/' + uid).on('value', function(snapshot) {
           var user = snapshot.val();
           if(user.mustLogin == null){
             //database.ref('user/' + uid + '/mustLogin').set(true); //TODO
             $state.go('inQueue');
           }
         });
       }else{
         //This queue does not exist
         $ionicPopup.alert({
             title: 'Error',
             template: 'This queue does not exist'
         });
       }
     });
   }
})

.controller('queueCtrl', function($scope, $state, $ionicPopup, $cordovaGeolocation) {
  //Init socket.io
  var socket = io('http://joinly.org/');
  socket.on('connect', function(){
    console.log('socket.io connection in queueCtrl');
    //Update contents using users on going queue
    firebase.auth().onAuthStateChanged(function(user){
      if (user) {
        var uid = user.uid;
        database.ref('user/' + user.uid + '/ongoingQueue').on('value', function(snapshot) {
          var queueId = snapshot.val();
          if(queueId){
            var queueDatabaseRef = database.ref('queue/'+queueId);
            queueDatabaseRef.on('value', function(snapshot){
              var queue = snapshot.val();

              //Get queue's logo
              $scope.queueLogo = queue.logoUrl || "http://vignette4.wikia.nocookie.net/destinypedia/images/b/b9/Unknown_License.png/revision/latest?cb=20130810221651";

              //Get place in queue
              updatePlaceInQueue(queue);

              //Get estimated time per customer from server
              updateEstimatedTimeLeft(queueId, $scope.placeInQueue);

              //React on changes in the queue
              //Sync with server / socket.io
              socket.on(uid, function (data) {
                if (data.action == 'place') {
                  $scope.placeInQueue = data.data;
                  if($scope.placeInQueue == 0){
                    //You are now out of queue
                    //TODO Rate view
                    $state.go('homeScreen');
                  }else if($scope.placeInQueue == 1){
                    //You are now first in queue
                    $scope.timeLeft = "0 minutes";
                    //MyTurn view
                    $ionicPopup.alert({
                      title: "Your turn!",
                      template: "Just go and get whatever you been queueing for :)"
                    });
                  }else if($scope.placeInQueue == 2){
                    //You are next in the queue
                    updateEstimatedTimeLeft(queueId, $scope.placeInQueue);
                  }else if($scope.placeInQueue == 4){ //TODO What is the size of buffer queue?
                    //You should now join buffer queue
                    updateEstimatedTimeLeft(queueId, $scope.placeInQueue);
                  }else{
                    updateEstimatedTimeLeft(queueId, $scope.placeInQueue);
                  }
                }else{
                  //Unkonow action
                }
              });

              function updatePlaceInQueue(neededQueue){
                for (var placeInQueue in neededQueue.queue) {
                  if (neededQueue.queue.hasOwnProperty(placeInQueue)) {
                    if(neededQueue.queue[placeInQueue] == uid){
                      $scope.placeInQueue = placeInQueue;
                    }
                  }
                }
              }
              function updateEstimatedTimeLeft(neededQueueId, userPlaceInQueue){
                cordovaHTTP.get("http://joinly.org/timePerCustomerInQueue", {
                  queue: neededQueueId
                }, {}, function(response) {
                    console.log(response.status);
                    try {
                        var res = JSON.parse(response.data);
                        console.log(res);
                        //Get time left
                        var timeLeft = res.minutes * userPlaceInQueue;
                        //Display time left
                        $scope.timeLeft = "~ " + timeLeft + " minutes";
                    } catch(e) {
                        console.error("JSON parsing error");
                        $scope.timeLeft = "Error in application";
                    }
                }, function(response) {
                    console.error(response.error);
                    $scope.timeLeft = "Error in application";
                });
              }

              //TODO Exit queue button

            });


            //TODO track user's location in background
            //Send location to the server
            //Let server handle the rest


          }//--> end of if(queueId)
        });
      }else{
        //No user signed in
      }
    });//--> End of onAuthStateChanged
  });//--> End of socket.io on connect
})

.controller('rateServiceCtrl', function($scope) {

})

.controller('termsOfUseCtrl', function($scope) {

})
