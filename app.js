var createError = require('http-errors');
var express = require('express');
var path = require('path');
var portHTTP=3000
var cors = require('cors')

var indexRouter = require('./routes/index');

var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var allowedOrigins = ['http://localhost:8080'];

var clients =[]

app.use(cors({
  origin: function(origin, callback){    // allow requests with no origin
    // (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}))

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {

  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

io.on('connect', function(socket){
  console.log('a user connected : ', socket.id);
  clients.push(socket)
  setTimeout(() => {
    socket.disconnect(true);
    let index = clients.map(cl => cl.id).findIndex(id => id==socket.id)
    clients.splice(index, 1)
  }, 5000);
});

http.listen(portHTTP, () => {
  console.log("Listen on port ", portHTTP)
})

module.exports =
{ app:app,
  sockets:clients,
};
