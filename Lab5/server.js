
var http = require('http');
var dispatcher = require('httpdispatcher');
var url = require('url');
var _ = require('underscore');

var PORT = 1234;
warehouse = new Array();

function handleReq(request, response){
  try {
    dispatcher.dispatch(request, response);
  } 
  catch(err) {
    console.log(err);
  }
  dispatcher.setStatic('resources');

  dispatcher.onPost("/", function(request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('Got Post Data' + request.body);
    console.log('Data received' + request.body)
    warehouse.push.apply(warehouse, JSON.parse(request.body));
  });

  dispatcher.onGet("/data", function(request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    url_parts = url.parse(request.url, true);
    query = url_parts.query;

    if  (_.isEmpty(query)) {
      response.end("Please insert a valid ID")
    } 
    else {
      warehouse.forEach( function(arrayItem) {
        var x = arrayItem.id;
        if(query.id == x){
          response.end(JSON.stringify(arrayItem));
        }
      });
    }
  });

  dispatcher.onGet("/alldata", function(request, response) {
    response.writeHead(200, {'Content-Type' : 'text/plain'});
    url_parts = url.parse(request.url, true);
    query = url_parts.query;

    if (_.isEmpty(query)) {
      response.end(JSON.stringify(warehouse));
    } 
    else {
      warehouse.forEach( function (arrayItem){
        if (query.offset && query.limit){
          var test = [];
          for(i=0; i < query.limit; i++){
            test.push(warehouse[query.offset - 1 + i])
          }
          response.end(JSON.stringify(test));
        } 
        else {
          response.end('please give a correct url query');
        }
      });
    }
  });
}

var server = http.createServer(handleReq);

server.listen(PORT, function(){
    console.log("Server on: http://localhost:", PORT);
});
