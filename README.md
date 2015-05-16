# a-scanner-orderly-web

What if you could order with your coaster? This is the Node.js code base for a project that does just that.

## Develop

Depends on Node/NPM

* Clone the repo
* `npm install`
* `npm start`
* Vist localhost:3000 or whatever env PORT is set to

## Arduino <-> Server <-> Client communication

Arduino <-> Server via `serialport`

Client <-> Server via `socket.io`

Baudrate 9600

- Drink Selected: Arduino -> Server -> Client
  * `new:[0-3],[0-3]`, e.g `new:1,2` 
  * Where the ordered pair is the index of the color for drink and mixer respectively
  * Trigger: two colors selected, via double tap
- Order Started: Client -> Server -> Arduino
  * `start`
  * Trigger: bartender selects 'Started' in Client UI
- Order Complete: Client -> Server -> Arduino
  * `finish`
  * Trigger: bartender selects 'Finished' in Client UI
- Order Delivered: Arduino -> Server -> Client
  * `delete`
  * Trigger: after finish state any weight of a full glass triggers order delivered
