//server_chat.js
 
// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
 
var port = process.env.PORT || 3000;
 
server.listen(port, function () {
  console.log('Server listening at port %d', port);
});
 
// Routing
app.use(express.static(__dirname + '/public'));
 
// Chatroom

// default run index.html on web browser
app.use(express.static(__dirname + '/public')); 
 
var numUsers = 0;
 
io.on('connection', function (socket) {
	console.log('connection ');
  var addedUser = false;
 
  // when the client emits 'new message', this listens and executes
  socket.on('new_message', function (data) {
    // we tell the client to execute 'new message'
	console.log('new_message ' + data);
    socket.broadcast.emit('new_message', {
      username: socket.username,
      message: data
    });
  });
 
  // when the client emits 'add user', this listens and executes
  socket.on('add_user', function (username) {
	  console.log('add_user ..' + username.username);
    if (addedUser) return;
 
    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user_joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });
 
  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });
 
  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop_typing', function () {
    socket.broadcast.emit('stop_typing', {
      username: socket.username
    });
  });
 
  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;
    console.log('user_left ..' + socket.username.username);
      // echo globally that this client has left
      socket.broadcast.emit('user_left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});