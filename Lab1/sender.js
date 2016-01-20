
var Broker_PORT = 1234;
var HOST = '127.0.0.1';
var fs = require ('fs');
var dg = require ('dgram');
var client = dg.createSocket ('udp4');

fs.readFile('sent.xml','utf8', 
  function (err, data) {
    if (err) throw err;
    var msg = new Buffer(data);

    client.send ( data, 0, msg.length, Broker_PORT, HOST, 
      function (err, bytes) {
        if (err) throw err;
        console.log ('Message sent:');
        console.log (HOST,':', Broker_PORT);
        client.close ();
      }
    );
  }
);
