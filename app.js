var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');
var fileName = './data.json';
var file = require(fileName);


app.listen(80);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.on('connection', function (socket) {
  // socket.emit('update', { hello: 'world' });
  file = {"trials":[],"ready":0}
  fs.writeFile(fileName, JSON.stringify(file), function (err) {
    if (err) return console.log(err);
      console.log(JSON.stringify(file));
      console.log('writing to ' + fileName);
      socket.emit('update', file);
  });

  socket.on('addReady', function (data) {
    console.log("Calling ready...")
    file["ready"] += 1
    fs.writeFile(fileName, JSON.stringify(file), function (err) {
      if (err) return console.log(err);
      console.log(JSON.stringify(file));
      console.log('writing to ' + fileName);
      socket.emit('update', file);
    });
  });

  socket.on('getJson', function (data) {
    // console.log("Calling getJson...")
    file = require(fileName);
    socket.emit('update', file);
  });
});
