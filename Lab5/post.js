var http = require('http');

var data = JSON.stringify(
  [
    {   id: "1",
    username: "test11",
    password: "test12"
    },
    {   id: "2",
    username: "test21",
    password: "test22"
    },
    {   id: "3",
    username: "test31",
    password: "test32"
    }
  ]
);

var options = {
  host: 'localhost',
  port: 1234,
  path: '/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(data)
  }
};

var req = http.request(options, function(res) {
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    console.log("body: " + chunk);
  });
});

req.write(data);
req.end();
