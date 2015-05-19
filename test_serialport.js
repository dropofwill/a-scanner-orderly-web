var serialport = require("serialport");
var SerialPort = serialport.SerialPort;

var serial = new SerialPort("/dev/tty.usbmodemfd121", {
  baudrate: 9600,
  parser: serialport.parsers.readline("\n")
});

serial.on("open", function () {
  console.log("open");

  serial.on("data", function (d) {
    console.log(d);
  });

  serial.write("ls\n", function (err, res) {
    console.log("err " + err);
    console.log("res " + res);
  });
});
