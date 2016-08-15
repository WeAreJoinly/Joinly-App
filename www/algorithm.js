//------------------------------------------------------------------------------
//--------------- User Join Queue ----------------------------------------------
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
//--------------- User In Queue (queueCtrl)-------------------------------------
//------------------------------------------------------------------------------

//Init socket.io
var socket = io('http://joinly.org/');
socket.on('connect', function(){
  console.log('socket.io connection in queueCtrl');
  //Update contents using users on going queue
  firebase.auth().onAuthStateChanged(function(user){
    if (user) {
      var uid = user.uid;
      database.ref('user/' + user.uid + '/ongoingQueues').on('value', function(snapshot) {
        var ongoingQueues = snapshot.val();

        //Set default value for select.ongoingQueues
        $scope.activeQueue = ongoingQueues[0];
        //TODO update select.ongoingQueues element with new queues
        //select.ongoingQueues onChange
        $scope.changeActiveQueue = function(){
          //TODO
          //Reload view with new queue's contents
          reloadQueueContent();
        }
        function reloadQueueContent(){
          var queueId = $scope.activeQueue || ongoingQueues[0];
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
                    $scope.timeLeft = '0 minutes';
                    //MyTurn view
                    $ionicPopup.alert({
                      title: 'Your turn!',
                      template: 'Just go and get whatever you been queueing for :)'
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
                cordovaHTTP.get('http://joinly.org/timePerCustomerInQueue', {
                  queue: neededQueueId
                }, {}, function(response) {
                    console.log(response.status);
                    try {
                        var res = JSON.parse(response.data);
                        console.log(res);
                        //Get time left
                        var timeLeft = res.minutes * userPlaceInQueue;
                        //Display time left
                        $scope.timeLeft = '~ ' + timeLeft + ' minutes';
                    } catch(e) {
                        console.error('JSON parsing error');
                        $scope.timeLeft = 'Error in application';
                    }
                }, function(response) {
                    console.error(response.error);
                    $scope.timeLeft = 'Error in application';
                });
              }

              //TODO Exit queue button

            });


            //TODO track user's location in background
            //Send location to the server
            //Let server handle the rest


          }//--> end of if(queueId)
        }//--> end of reloadQueueContent()
      });
    }else{
      //No user signed in
    }
  });//--> End of onAuthStateChanged
});//--> End of socket.io on connect

//------------------------------------------------------------------------------
//--------------- Queue Manager ------------------------------------------------
//------------------------------------------------------------------------------
var socket = io('http://joinly.org/');
socket.on('connect', function(){
  //TODO: Sign in and create queue functions
  //TODO: Get queueId
  //TODO: Next customer button
  //socket.emit('next', { queueId: queueId});
  //TODO: Show amount of customers in queue
});

//------------------------------------------------------------------------------
//--------------- Server -------------------------------------------------------
//------------------------------------------------------------------------------
app.get('/timePerCustomerInQueue', function(req, res){
  var queueId = req.query.queue;
  //TODO count estimated time per customer
  var response = {
    minutes: 0.5
  }
  res.send(response);
});

io.on('connection', function (socket) {
  socket.on('next', function(data){
    //Queue manager clicked next customer button
    //data = {queueId}

    var queueId = data.queueId;

    database.ref('queue/'+queueId).on('value', function(snapshot){
      var queue = snapshot.val();

      //Generate new queue after user exit
      var newQueue = {};
      for (var userInQueue in queue.queue) {
        if (queue.queue.hasOwnProperty(userInQueue)) {

          var newPlaceInQueue = userInQueue - 1;

          if(newPlaceInQueue == 0){
            //You are now out of queue
          }else if(newPlaceInQueue == 1){
            //You are now first in queue
            newQueue[userInQueue - 1] = queue.queue[userInQueue];
            notify(userInQueue, 'This is your turn!');
          }else if(newPlaceInQueue == 2){
            //You are next in the queue
            newQueue[userInQueue - 1] = queue.queue[userInQueue];
            notify(userInQueue, 'You\'re next!');
          }else if(newPlaceInQueue == 4){ //TODO What is the size of buffer queue?
            //User should now join buffer queue
            newQueue[userInQueue - 1] = queue.queue[userInQueue];
            notify(userInQueue, 'It is time to go back to the queue!');
          }else{
            newQueue[userInQueue - 1] = queue.queue[userInQueue];
          }

          updateUser(queue.queue[userInQueue], 'place', userInQueue - 1);
        }
      }

        database.ref('queue/'+queueId+'/queue').set(newQueue);

    });

  });

  socket.on('exit', function(data){
    //Someone wants to exit the queue
    //data = {queueId, uid}
    database.ref('queue/'+data.queueId).on('value', function(snapshot){
      var queue = snapshot.val();

      //Generate new queue after user exit
      var newQueue = {};
      for (var userInQueue in queue.queue) {
        if (queue.queue.hasOwnProperty(userInQueue)) {
          if(queue.queue[userInQueue] == data.uid){
            //This is the user which wants to exit
            //All users behind it must be moved one place forward
                for (var placeInQueueOfUser in queue.queue) {
                  if (queue.queue.hasOwnProperty(placeInQueueOfUser)) {
                    //Check if user is in the queue after the leaving user
                    if(placeInQueueOfUser > userInQueue){
                      var newPlaceInQueue = placeInQueueOfUser - 1;
                      newQueue[newPlaceInQueue] = queue.queue[placeInQueueOfUser];
                      var uid = queue.queue[placeInQueueOfUser];
                      //Send necessary notifications
                        if(newPlaceInQueue == 1){
                          //You are now first in queue
                          notify(uid, 'This is your turn!');
                        }else if(newPlaceInQueue == 2){
                          //You are next in the queue
                          notify(uid, 'You\'re next!');
                        }else if(newPlaceInQueue == 4){ //TODO What is the size of buffer queue?
                          //User should now join buffer queue
                          notify(uid, 'It is time to go back to the queue!');
                        }
                        updateUser(uid, 'place', newPlaceInQueue);
                    }else if (placeInQueueOfUser == userInQueue) {
                      //Don't enter user to the newQueue, cause it is leaving now
                      //Remove user's ongoing queue from database
                      database.ref('user/'+uid+'/ongoingQueues').on('value', function(snapshot){
                        var ongoingQueues = snapshot.val();
                        for (var ongoingQueue in ongoingQueues) {
                          if (ongoingQueues.hasOwnProperty(ongoingQueue)) {
                            if(ongoingQueues[ongoingQueue] == data.queueId){
                              //This is queue to remove
                              database.ref('user/'+uid+'/ongoingQueues/'+data.queueId).set(null);
                            }
                          }
                        }
                      });
                    }else{
                      newQueue[placeInQueueOfUser] = queue.queue[placeInQueueOfUser];
                    }
                  }
                }
          }
        }
      }

      database.ref('queue/'+queueId+'/queue').set(newQueue);
    });
  });

  socket.on('join', function(data){
    //Someone wants to join the queue
    //data = {uid, queueId}

    //Update user's ongoing queue
    var newQueueKey = firebase.database().ref('user/' + data.uid + '/ongoingQueues').push().key;
    database.ref('user/' + data.uid + '/ongoingQueues/' + newQueueKey).set(data.queueId);

    //Insert user into queue.queue
    database.ref('queue/' + data.queueId + '/queue').on('value', function(snapshot){
      var queue = snapshot.val();
      var placeInQueue = Object.keys(queue).length + 1;
      database.ref('queue/' + data.queueId + '/queue/' + placeInQueue).set(queue.uid);
    });
  });

  function updateUser(uid, action, data){
    socket.emit(uid, { action: action, data: data});
  }
})

function notify(uid, text){
  //TODO Send push notification to user's phone
}
