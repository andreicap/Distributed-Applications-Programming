var net = require('net');
var JsonSocket = require('json-socket');
var clientTCP = net.createServer();
var _ = require('underscore');
var fs = require('fs');
var dgram = require('dgram');
var clientUDP = dgram.createSocket('udp4');
var libxml = require("libxmljs");
var assert = require("assert");

var SRC_PORT = 6025;
var PORT = 3000;
var MULTICAST_ADDR = '239.255.255.250';

var maven = '';
var mavenNeighbours = 0;
var mavenData = 0;
var totalAvgSalary = [];

//validation string
var xsd = '<xs:schema attributeFormDefault="unqualified" elementFormDefault="qualified" xmlns:xs="http://www.w3.org/2001/XMLSchema"><xs:element name="MAVEN"><xs:complexType><xs:sequence><xs:element name="item" maxOccurs="unbounded" minOccurs="0"><xs:complexType><xs:sequence><xs:element type="xs:string" name="firstName"/><xs:element type="xs:string" name="lastName"/><xs:element type="xs:string" name="departament"/><xs:element type="xs:short" name="salary"/></xs:sequence></xs:complexType></xs:element></xs:sequence></xs:complexType></xs:element></xs:schema>';

clientUDP.bind(SRC_PORT, function () {
  multicastNew();
  setTimeout(mavenRequest,2000);
});

clientUDP.on('listening', function () {
  var address = clientUDP.address();
  console.log('UDP Client listening on ' + address.address + ':' + address.port +' (multicast address).\n');
  console.log('Node answers');
});


//dumb parsing "Host:127.0.0.5 has 1 neighbours and 4 employees the average salary is 52"
clientUDP.on('message', function (messageFromNodes, rinfo) {
  var host = String(messageFromNodes).substring(6, 15);
  var host = String(messageFromNodes).substring(6, 15);
  var neighbours = parseInt(String(messageFromNodes).substring(20, 24));
  var employees = parseInt(String(messageFromNodes).substring(37));
  var AvgSalary = parseInt(String(messageFromNodes).substring(71));
  totalAvgSalary.push(AvgSalary)
  console.log('Host: ' + host + ':' + PORT + 
    ' has:' + neighbours + ' neighbours and ' + 
    employees + ' employees,' +
    ' the average salary is ' + AvgSalary);    if (neighbours >= mavenNeighbours ) {
    if (employees >= mavenData) {
      maven = host;
      mavenNeighbours = neighbours;
      mavenData = employees;
    };
  };
  console.log('Maven Host: ' + maven + ':' + PORT +
    ' has:' + mavenNeighbours + ' neighbours,' +
    ' and'+ mavenData + ' employees');
});

function multicastNew() {
  var messageClient = new Buffer ('host & neighbours & employers');
  console.log('Sending multicast the command' + 
        messageClient + 
        ' \n to all listening nodes on multicast address ' + 
        MULTICAST_ADDR + ':' + PORT);  
  clientUDP.send(messageClient, 0, messageClient.length, PORT , MULTICAST_ADDR, function () {
  });
};

function mavenRequest () {
  console.log('\nFinal Maven: ' + 
    maven + ':' + PORT +
    '(' + mavenNeighbours + ' neighbours and ' + 
    mavenData + ' employees)\n');
  var socket = new JsonSocket(new net.Socket());
  socket.connect(PORT, maven, function(){
    socket.sendMessage({command: 'MavenRequestData'});
    socket.on('message', function(MavenRequestData) {
      console.log('Data recived: ' + MavenRequestData + '\n');
      fs.writeFile("data.xml", MavenRequestData, function(err) {
        xsdDoc = libxml.parseXml(xsd);
        xmlDocValid = libxml.parseXml(fs.readFileSync('data.xml').toString());
        assert.equal(xmlDocValid.validate(xsdDoc), true, 'XML Schema is not validated');
        console.log("XML saved in data.xml");
        if(err) {
          return console.log(err);
        };
      });
    });
  });
};






