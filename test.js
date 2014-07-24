var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendfile('test.html');
});

var users =
{
    	id: "",
    	connected: false
}

var room = "abc";
var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

var details={};
io.on('connection', function(socket){
  socket.on('client detail', function(msg){
  	users[msg] ={
  		id: socket.id,
  		connected: false
  	}
  	details[msg] = socket.id;
  	console.log(msg);
  });
   socket.on('display', function(){
  	console.log(details);
  	io.emit('lista',details,users);
  });
   socket.on('call client',function(name){

   	socket.to(details[name.op]).emit('to socket', name.cu);
   	socket.join(room);
   });
   socket.on('accepted',function(name){
   	socket.to(details[name.op]).emit('confirm',name.cu,name.op);
   	socket.join(room);
   });
   socket.on('disable buttons', function(a, b){
    io.emit('disable', a, b);
    var clients = io.sockets.adapter.rooms['abc'];
    console.log(clients);
    io.in(room).emit('play');
   });
   socket.on('divclicked', function(num, t){
      if( t == 0)
        t = 1;
      else
        t = 0;
      io.in(room).emit('divputsymbol', num, t);
   });
   socket.on('won', function(winner, loser){
    socket.to(details[winner]).emit('win');
    socket.to(details[loser]).emit('lose');
   });
   socket.on('refresh',function(){
    io.in(room).emit('reload');
   });
   socket.on('disconnect', function(){
    // console.log('user disconnected');
    for (var ke in details)
    {
      if (details[ke] == socket.id) 
        {
          io.emit('update', ke);
        }
    }
  });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});