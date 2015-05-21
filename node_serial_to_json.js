var serialport = require("serialport"),				    // include the serialport library
    SerialPort  = serialport.SerialPort,			    // make a local instance of serial
    app = require('express')(),						        // start Express framework
    server = require('http').createServer(app),		// start an HTTP server
    io = require('socket.io').listen(server);	  	// filter the server using socket.io

// /dev/tty.usbmodemfd121
// /dev/tty.usbmodemfd131

server.listen(8080);
console.log("Listening for new clients on port 8080");
var connected = false;
var spirit_array = ["Vodka", "Gin", "Rum"];
var mixer_array = ["Lemon Lime Soda", "Orange Juice", "Cranberry Juice"];

serialport.list(function (err, ports) {
  ports.forEach(function(port) {
    console.log(port.comName);

      p = new SerialPort(port.comName, {
        baudrate: 9600,
        parser: serialport.parsers.readline("\r\n")
      });

      p.on('error', function(e) { console.log(e); });

      p.open(function (error) {
        if (error) {
          console.log("Couldn't connect to: " + port.comName);
        }
        else {
          p.on('data', function (data) {
            console.log(data);

            if (is_a_scanner(data)) {
              close_response();
            }
            else if (is_drink_order(data)) {
              var drink = JSON.parse(data).drink;
              // send drink to the view with socket.io
              processed_data = convert_drink_response(port, data);
              io.emit("new", processed_data);
              close_response();
            }
            else if (is_drink_ready(data)) {
              var finish = true;
              // send finish to the view with socket.io
              // TODO
              close_response();
            }
          });
        }
      });
  });
});

// send a byte to the serial port to tell it that we're done
function close_response(port) {
  port.flush();
  port.write('$');
}

function convert_drink_response(port, data) {
  return { "id":     port.comName,
           "spirit": data[0],
           "mixer":  data[1] };
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

function is_drink_ready(data) {
  if (data === "ready") {
    return true;
  }
  else {
    return false;
  }
}

// respond to web GET requests with the index.html page:
app.get('/', function (request, response) {
  response.sendfile(__dirname + '/index.html');
});

// listen for new socket.io connections:
io.sockets.on('connection', function (socket) {
  // if the client connects:
  // if (!connected) {
  //   // clear out any old data from the serial bufffer:
  //   myPort.flush();
  //   // send a byte to the serial port to ask for data:
  //   myPort.write('c');
  //   console.log('user connected');
  //   connected = true;
  // }

  // if the client disconnects:
  // socket.on('disconnect', function () {
  //   myPort.write('x');
  //   console.log('user disconnected');
  //   connected = false;
  // });
  //
  // // listen for new serial data:
  // myPort.on('data', function (data) {
  //   // Convert the string into a JSON object:
  //   var serialData = JSON.parse(data);
  //   // for debugging, you should see this in the terminal window:
  //   console.log(data);
  //   // send a serial event to the web client with the data:
  //   socket.emit('serialEvent', serialData);
  // });
});
