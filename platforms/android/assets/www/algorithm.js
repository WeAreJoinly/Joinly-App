//------------------------------------------------------------------------------
//--------------- User In Queue ------------------------------------------------
//------------------------------------------------------------------------------

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
          //Get queue's logo
          database.ref('queue/'+queueId+'/logoUrl').on('value', function(snapshot){
            var logoUrl = snapshot.val();
            $scope.queueLogo = logoUrl || "https://pbs.twimg.com/profile_images/435780569687810048/I9j3va7e.png";
          });
          //TODO get estimated time per customer from server
          //TODO get place in queue
          //TODO display time left
          //TODO react on changes in the queue
          //TODO show "It is your time" view when it is it is user's time
          //TODO Exit queue button
        }
      }
    }else{
      //No user signed in
    }
  });//--> End of onAuthStateChanged
}//--> End of socket.io on connect

//------------------------------------------------------------------------------
//--------------- Queue Manager ------------------------------------------------
//------------------------------------------------------------------------------


//------------------------------------------------------------------------------
//--------------- Server -------------------------------------------------------
//------------------------------------------------------------------------------
