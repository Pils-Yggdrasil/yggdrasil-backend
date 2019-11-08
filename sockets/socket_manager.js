console.log("I am goods")

var clients =[]

var _init_manager = function(io){
  io.on('connect', onRequest);
}

var onRequest = function(socket){
  console.log('a user connected : ', socket.id);
  clients.push(socket);
  socket.emit("id", socket.id)
  setTimeout(disconnectSocket.bind(null,socket), 120000);
}

var disconnectSocket = function(socket){
  console.log("a user leaves : ", socket.id)
  socket.disconnect(true);
  let index = clients.findIndex(client => client.id==socket.id)
  clients.splice(index, 1)
  return true;
}

module.exports=
{
  init:_init_manager,
  sockets:clients,
  disconnect:disconnectSocket,
}
