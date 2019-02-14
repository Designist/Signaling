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
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
    console.log("Hello!!")
    file.key = data
    fs.writeFile(fileName, JSON.stringify(file), function (err) {
      if (err) return console.log(err);
      console.log(JSON.stringify(file));
      console.log('writing to ' + fileName);
    });
  });
});
