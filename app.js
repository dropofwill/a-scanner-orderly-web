var express = require('express');
var app = express();

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var routes = require('./routes/index');
var users = require('./routes/users');
process.env.PWD = process.cwd();
var port = process.env.PORT || process.env.NODE_PORT || 3000;

// view engine setup
app.use(express.static(path.join(process.env.PWD, 'public')));
app.set('views', path.resolve(path.join(process.env.PWD, 'views')));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(process.env.PWD + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('node-compass')({mode: 'expanded'}));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
/////////////////////////////////////
//SOCKET IO STUFF
/////////////////////////////////////
io.on('connection', function(socket){
  //Handles begin event from client
  socket.on('begin', function(data){

  });
  //Handles ready event from client
  socket.on('ready', function(data){

  });
});
/** EMIT THESE
 * New
 * End
 * io.emit('end', data);
 */

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;