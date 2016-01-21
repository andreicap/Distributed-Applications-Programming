var http = require('http');

var data = JSON.stringify(
  [
    {   id: "4",
    username: "test41",
    password: "test52"
    },
    {   id: "5",
    username: "test51",
    password: "test52"
    },
    {   id: "6",
    username: "test61",
    password: "test62!"
    }
  ]
);

var options = {
  host: 'localhost',
  port: 1234,
  path: '/',
  method: 'Post',
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
