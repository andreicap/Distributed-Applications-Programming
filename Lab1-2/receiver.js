
var BROKER_PORT = 1234;
var HOST  = '127.0.0.1';
var r_file = "received.xml";

var fs = require('fs');
var dg = require('dgram');
var server = dg.createSocket ('udp4');
var parser = require ('xml2json');

server.on ('listening', 
  function () {
    var addr = server.address ();
    console.log('Broker:');
    console.log (addr.address, ':', addr.port);
  }
);

server.on ('message', 
  function (message, sender) {
    console.log (sender.address, ':', sender.port, '\n'+ message); 
    var contentsXML = fs.writeFile( r_file, message,
      function (error) {
        if (error) {
          console.log ("Error occured during writing into:", r_file);
        }
        console.log ("The XML saved in: ", r_file);
      });
  }
);

server.bind (BROKER_PORT, HOST);
