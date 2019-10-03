var createError = require('http-errors');
var express = require('express');
var path = require('path');
var portHTTP=3000
console.log("Bonjour")
var indexRouter = require('./routes/index');
console.log("Router for index ok")
var app = express();

console.log("App created")

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
console.log("Public set")

app.use('/', indexRouter);
console.log("use /")

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log("Oups")
  next(createError(404));
});

console.log("post use")
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  console.log(err,req,res,next)
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(portHTTP, () => {
  console.log("App started on port HTTP : "+portHTTP)
})

module.exports = app;
