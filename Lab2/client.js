var net = require('net');
var JsonSocket = require('json-socket');
var clientTCP = net.createServer();
var _ = require('underscore');
var fs = require('fs');
var dgram = require('dgram');
var clientUDP = dgram.createSocket('udp4');

var SRC_PORT = 6025;
var PORT = 3000;
var MULTICAST_ADDR = '239.255.255.250';

var maven = '';
var mavenNeighbours = 0;
var mavenData = 0;
var totalAvgSalary = [];

clientUDP.bind(SRC_PORT, function () {
    multicastNew();
    setTimeout(mavenRequest, 2000);
});


clientUDP.on('listening', function () {
    var address = clientUDP.address();
    console.log('UDP Client listening on ' + 
            address.address + ':' + 
            address.port + 
            '(multicast address).\n');
    console.log('Nodes answers:');
});


//dumb parsing "Host:127.0.0.5 has 1 neighbours and 4 employees the average salary is 52"
clientUDP.on('message', function (messageFromNodes, rinfo) {
    var host = String(messageFromNodes).substring(6, 15);
    var neighbours = parseInt(String(messageFromNodes).substring(20, 24));
    var employees = parseInt(String(messageFromNodes).substring(37));
    var AvgSalary = parseInt(String(messageFromNodes).substring(71));
    totalAvgSalary.push(AvgSalary)
    console.log('Host: ' + host + ':' + PORT + 
        ' has:' + neighbours + ' neighbours and ' + 
        employees + ' employees,' +
        ' the average salary is ' + AvgSalary);
    // Choosing the maven node by some criteria(>neighbours && >employees)
    if (neighbours >= mavenNeighbours ) {
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
            console.log('Data recived: '+JSON.stringify(MavenRequestData)+'\n');
            var filterResult = filter(MavenRequestData);
            console.log('Filter result: '+JSON.stringify(filterResult));
            fs.writeFile("data.json", JSON.stringify(filterResult), function(err) {
                console.log("Filtered result was saved in data.json.");
                if(err) {
                    return console.log(err);
                };
            });
        });
    });
};

function filter(collection) {
    var total = 0;
    for(var i = 0; i < totalAvgSalary.length; i++) {
        total = totalAvgSalary[i]+total;
    }
    var resultTotalAvgSalary = total / totalAvgSalary.length
    console.log('Filer key: test_513;' + 
        '\nFilter by salary (' + resultTotalAvgSalary+ ')' + 
        '\nSorting by last name in json.\n'
        );
    var filterDepartament = _.groupBy(collection, function(value){
                return value.departament
    });
    var filterSalary = _.filter(filterDepartament['test_513'], 
      function(num){ 
        return num.salary > resultTotalAvgSalary; 
      }
    );
    var filterName = _.sortBy(filterSalary, 'lastName');
    return filterName
}







