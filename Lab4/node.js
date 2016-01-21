if (process.argv.length <= 5) {
  console.log("Incorect parameters");
  process.exit(-1);
}

var HOST = process.argv[2];
var PORT = process.argv[3];
var neighbours = JSON.parse(process.argv[4]);
var data_file = process.argv[5];

var net = require('net');
var JsonSocket = require('json-socket');
var extend = require('extend');
var dgram = require('dgram');
var nodeUDP = dgram.createSocket({ type: 'udp4', reuseAddr: true });
var fs = require('fs')
var Js2Xml = require("js2xml").Js2Xml;

console.log('Host:', HOST);
console.log('Port:', PORT);
console.log('Neighbours:', neighbours);
console.log('Data file :', data_file);

var SRC_PORT = 6025;
var MULTICAST_ADDR = '239.255.255.250';

var employeeDict =JSON.parse(fs.readFileSync('data/'+data_file));
var employeeLength = employeeDict.length;

nodeUDP.on('listening', function () {
  var address = nodeUDP.address();
  console.log('UDP Node is listening on ' + address.address + ":" + address.port);
});

nodeUDP.on('message', function (messageFromClient, rinfo) {
  console.log('Recived multicast command' + 
      messageFromClient+ 
      'from the client address:' + 
      rinfo.address + ':' + rinfo.port );  
  if (messageFromClient=='host & neighbours & employers') {
    avgSalary = averageSalary();
    numberNeighbours = neighbours.length;
    messageFromNodes = '\nHost:' + 
        HOST+' has ' + numberNeighbours + 
          ' neighbours and ' + employeeLength + 
          ' employees' + 
          ' the average salary is ' + avgSalary;    nodeUDP.send(messageFromNodes, 0, messageFromNodes.length, rinfo.port , rinfo.address, function () {
      console.log('Sending answer' + 
        messageFromClient + 
        '(' + messageFromNodes + ')');
    });
  };
});

nodeUDP.bind(PORT, function () {
  nodeUDP.addMembership(MULTICAST_ADDR);
});

net.createServer(function(socket) {
  socket = new JsonSocket(socket);
  socket.on('message', function(message) {
    if (message.command == 'RequestData') {
      socket.sendMessage(employeeDict);
    } else if(message.command == 'MavenRequestData'){
      for (var i = 0; i < neighbours.length; i++) {
        neighboursDataCollection(i);
      }
      setTimeout(function sendMessageClient(){employeeDictXml = new Js2Xml("MAVEN", employeeDict);},400);
      setTimeout(function sendMessageClient(){socket.sendMessage(employeeDictXml.toString())},500);
      }
    });
}).listen(PORT, HOST);
console.log('TCP Node is listening on ', HOST, ':', PORT);

function neighboursDataCollection(i) {
  var socket = new JsonSocket(new net.Socket());
  socket.connect(PORT, neighbours[i], function(){
    socket.sendMessage({command: 'RequestData'});
    socket.on('message', function(RequestData) {
      employeeDict.push.apply(employeeDict, RequestData);
    });
  });
};

function averageSalary () {
  var arrSalary = [];
  var arrSalaryInt = [];
  var total = 0;
  for (var id in employeeDict) {
    arrSalary.push(employeeDict[id]["salary"]);
  }
  for(var i = 0; i < arrSalary.length; i++) {
    arrSalaryInt[i] = parseInt(arrSalary[i]);
    total = arrSalaryInt[i]+total;
  }
  var avg = total / arrSalaryInt.length
  return avg;
}

