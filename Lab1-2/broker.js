
var RECEIVER_PORT = 2345;
var SENDER_PORT = 1234;

var HOST = '127.0.0.1';
var fs = require('fs');
var dg = require('dgram');
var broker = dg.createSocket ('udp4');

broker.on('listening', 
  function () {
    var addr = broker.address();
    console.log ('Broker on:');
    console.log (addr.address, ':', addr.port);
  }
);

broker.on ('message', 
  function (msg, remote) {
    broker.send (msg, 0, msg.length, SENDER_PORT , HOST, 
      function (err, bytes) {
        if (err) throw err;
        console.log ('Forwarding error'); 
        broker.close ();
      }
    );
  }
);

broker.bind (RECEIVER_PORT, HOST);
