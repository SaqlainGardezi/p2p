var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// usernames which are currently connected to the chat
var usernames = {};
var sockets={};

io.sockets.on('connection', function (socket) {
	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.emit('updatechat', socket.username, data);
	});

	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(username){
		// we store the username in the socket session for this client
		socket.username = username;
		//console.log(username + "My socket is " + socket);
		
		// store  id based on name
		
		//socket[username]=socket.id;
		//socket[username]={ username : username, socket : socket };
		sockets[username]=socket;
		//sockets[socket.id] = { username : username, socket : socket }; 

		// add the client's username to the global list
		usernames[username] = username;
		// echo to client they've connected
		socket.emit('updatechat', 'SERVER', 'you have connected');
		// echo globally (all clients) that a person has connected
		socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
		// update the list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
	});

	//Private Messaging
	socket.on('privatemsg', function(receiver, msg){
		 // sockets[users[to]].emit;
		// console.log("socket value is " + socket);
		if (sockets[receiver]) {
		 sockets[receiver].emit('showprivatemsg',socket.username,msg );
		}
		else{
			console.log("User not found");
		 //sockets[receiver].emit('showprivatemsg',socket.username,msg );
		}
		//console.log("receiver name " + receiver + "receiver socket id " +socket[receiver]);
	});



});

http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
});
    