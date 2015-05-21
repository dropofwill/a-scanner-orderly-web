var express = require('express'),
    app = express();

var path         = require('path'),
    http         = require('http').Server(app),
    serialport   = require("serialport"),
    SerialPort   = serialport.SerialPort;
var io           = require('socket.io')(http);
var routes = require('./routes/index');

var connected    = false,
    color_array  = ["label-warning", "label-success", "label-primary"],
    spirit_array = ["Vodka", "Gin", "Rum"],
    mixer_array  = ["Cranberry Juice", "Lemon Lime Soda", "Orange Juice"];

process.env.PWD = process.cwd();
var port_object = {};
var port = process.env.PORT || process.env.NODE_PORT || 3000;

// view engine setup
app.use(express.static(path.join(process.env.PWD, 'public')));
app.set('views', path.resolve(path.join(process.env.PWD, 'views')));
app.set('view engine', 'jade');

app.get('/', function(req, res){
  // the html string being sent
  var filepath = path.resolve(__dirname + '/views/index.html');
  res.sendFile(filepath);
});

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
    console.log(data.port);
    begin_drink_response(port_object[data.port]);
  });

  //Handles ready event from client
  socket.on('ready', function(data){
    console.log(data.port);
    ready_drink_response(port_object[data.port]);
  });
});

// Loop over all available serial ports looking for open-able data ports
serialport.list(function (err, ports) {
  non_bluetooth_ports = ports.filter(function (el) {
    console.log(el.comName);
    if (el.comName.indexOf("Bluetooth") > 0) return false;
    else return true;
  });
  console.log(non_bluetooth_ports);
  non_bluetooth_ports.forEach(function(port) {
    console.log(port.comName);

    p = new SerialPort(port.comName, {
      baudrate: 9600,
      parser: serialport.parsers.readline("\r\n")
    });

    port_object[port.comName] = p;

    p.on('error', function(e) { console.log(e); });

    p.open(function (error) {
      if (error) {
        console.log("Couldn't connect to: " + port.comName);
      }
      else {
        p.on('data', function (data) {
          console.log(data);

          if (is_a_scanner(data)) {
            close_response(p);
          }
          else if (is_drink_order(data)) {
            var drink = JSON.parse(data).drink;
            // send drink to the view with socket.io
            var processed_data = convert_drink_response(port, drink);
            console.log(processed_data);
            close_response(p);
            io.emit("new", processed_data);
          }
          else if (was_drink_delivered(data)) {
            var finish = true;
            // send finish to the view with socket.io
            io.emit('end', { id: port_to_id(port) } );
            close_response(p);
          }
        });
      }
    });
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


// Helper Methods

// send a byte to the serial port to tell it that we're done
function close_response(port) {
  port.flush();
  port.write('$');
}

function begin_drink_response(port){
  port.flush();
  port.write('[');
}

function ready_drink_response(port){
  port.flush();
  port.write(']');
}

function port_to_id(port) {
  return port.comName.split("/").pop().split(".").pop();
}

function convert_drink_response(port, data) {
  return { "id":           port_to_id(port),
           "port":         port.comName,
           "spirit":       spirit_array[data[0]],
           "spirit_class": color_array[data[0]],
           "mixer":        mixer_array[data[1]],
           "mixer_class":  color_array[data[1]]};
}

function is_a_scanner(data) {
  if (data === "connect") {
    return true;
  }
  else {
    return false;
  }
}

function is_drink_order(data) {
  try {
    json_res = JSON.parse(data);
  }
  catch (e) {
    return false;
  }

  if (typeof json_res.drink !== "undefined") {
    return true;
  }
  else  {
    return false;
  }
}

function was_drink_delivered(data) {
  if (data === "delivered") {
    return true;
  }
  else {
    return false;
  }
}

module.exports = app;

http.listen(8000, function(){
  console.log('listening on *:3000');
});
