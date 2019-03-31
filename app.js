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
  threshold = 20 // number correct to end game
  file={
    "trials": [[]],
    "objects": [],
    "guesses": [],
    "num_symbols": 0,
    "turn": "sender",
    "iter": 0,
    "show_signal": false,
    "object_shown": false,
    "game_over": false
  }

  fs.writeFile(fileName, JSON.stringify(file), function (err) {
    if (err) return console.log(err);
      console.log("Initiating session...")
      console.log(JSON.stringify(file));
      console.log('writing to ' + fileName);
      socket.emit('update', file);
  });

  socket.on('cleartrial', function (data) {
    console.log("Clearing...")
    file = require(fileName);
    file["trials"]["iter"] = []
    file["num_symbols"] = 0
    socket.emit('update', file);
  });

  // socket.on('init_iter', function (data) {
  //   // console.log("Calling getJson...")
  //   file["trials"].push([])
  //   file["num_symbols"] = 0
  //   socket.emit('update', file);
  // });

  // socket.on('end_iter', function (data) {
  //   // console.log("Calling getJson...")
  //   file["init"] += 1
  //   socket.emit('update', file);
  // });

  socket.on('hide_signal', function (data) {
    // console.log("Calling getJson...")
    file["show_signal"] = false;
    socket.emit('update', file);
  });

  socket.on('show_signal', function (data) {
    // console.log("Calling getJson...")
    file["show_signal"] = true;
    socket.emit('update', file);
  });

  socket.on('new_object', function (data) {
    // console.log("Calling getJson...")
    file["objects"].push(data["object"]);
    file["object_shown"] = true
    console.log(file)
    socket.emit('update', file);
  });

  socket.on('submit', function (data) {
    if (file["num_symbols"] <= 2 && file["num_symbols"] > 0) {
      socket.emit("submit_success", file)
      file["turn"] = "receiver"
      file["num_symbols"] = 0
      file["show_signal"] = true
    } else {
      socket.emit("submit_failure", file)
    }
  });

  // socket.on('addReady', function (data) {
  //   console.log("Calling ready...")
  //   file["ready"] += 1
  //   fs.writeFile(fileName, JSON.stringify(file), function (err) {
  //     if (err) return console.log(err);
  //     console.log(JSON.stringify(file));
  //     console.log('writing to ' + fileName);
  //     socket.emit('update', file);
  //   });
  // });

  socket.on('dataalert', function (data) {
    socket.emit('update', file);
    socket.emit('show', JSON.stringify(file));
  });

  socket.on('click1', function (data) {
    if (file["num_symbols"] < 2) {
      file["trials"][file["iter"]].push(1)
      file["num_symbols"] += 1
    } else {
      socket.emit('show', "Too many symbols! Click 'submit' now.");
    }
  });

  socket.on('click2', function (data) {
    if (file["num_symbols"] < 2) {
      file["trials"][file["iter"]].push(2)
      file["num_symbols"] += 1
    } else {
      socket.emit('show', "Too many symbols! Click 'submit' now.");
    }
  });

  socket.on('click3', function (data) {
    if (file["num_symbols"] < 2) {
      file["trials"][file["iter"]].push(3)
      file["num_symbols"] += 1
    } else {
      socket.emit('show', "Too many symbols! Click 'submit' now.");
    }
  });

  socket.on('click4', function (data) {
    if (file["num_symbols"] < 2) {
      file["trials"][file["iter"]].push(4)
      file["num_symbols"] += 1
    } else {
      socket.emit('show', "Too many symbols! Click 'submit' now.");
    }
  });

  function get_accuracy(num) {
    // get accuracy % over last num trials
    counter = 0
    num_correct = 0
    val = file["iter"] - 1
    while (counter < num && val >= 0) {
      console.log(val)
      if (file["guesses"][val] == file["objects"][val]) {
        num_correct += 1
      }
      counter += 1
      val = file["iter"] - counter - 1
    }
    acc = num_correct/counter
    // socket.emit('show', acc.toString())
    return acc
  }

  function win() {
    fs.writeFile(fileName, JSON.stringify(file), function (err) {
      if (err) return console.log(err);
      console.log(JSON.stringify(file));
      console.log('Writing to ' + fileName);
      socket.emit('update', file);
    });
  }

  function new_iter() {
    file["iter"] += 1;
    file["trials"].push([])
    file["turn"] = "sender";
    file["object_shown"] = false;

    acc = get_accuracy(threshold)
    if (acc > 0.99 && file["objects"].length > threshold) { 
      file["game_over"] = true
      win()
    }
  }

  socket.on('guess', function (data) {
    if (file["guesses"].length < file["objects"].length) {
      file["guesses"].push(data["val"])
    } else {
      socket.emit('show', "Too many guesses!");
    }
    new_iter()
    socket.emit('update', file);
  });

  socket.on('getJson', function (data) {
    // console.log("Calling getJson...")
    socket.emit('update', file);
  });

  socket.on('disconnect', function() {
    delete file;
  });
});
