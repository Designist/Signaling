var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');
var fileName = './data.json';
// var file = require(fileName);


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
  threshold = 10 // number correct to end game
  num_sessions = 10
  files = []
  for (var i=0; i<num_sessions; i++) {
    file = {
      "trials": [[]],
      "objects": [],
      "guesses": [],
      "heldout": [5,7],
      "num_symbols": 0,
      "turn": "sender",
      "iter": 0,
      "show_signal": false,
      "object_shown": false,
      "game_over": false
    }
    files.push(file)
  }

  // fs.writeFile(fileName, "", function (err) {
  //   if (err) return console.log(err);
  // });
  

  socket.on('cleartrial', function (data) {
    console.log("Clearing...")
    files[data["session_num"]]["trials"]["iter"] = []
    files[data["session_num"]]["num_symbols"] = 0
    socket.emit('update', files[data["session_num"]]);
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
    files[data["session_num"]]["show_signal"] = false;
    socket.emit('update', files[data["session_num"]]);
  });

  socket.on('show_signal', function (data) {
    // console.log("Calling getJson...")
    files[data["session_num"]]["show_signal"] = true;
    socket.emit('update', files[data["session_num"]]);
  });

  socket.on('new_object', function (data) {
    // console.log("Calling getJson...")
    files[data["session_num"]]["objects"].push(data["object"]);
    files[data["session_num"]]["object_shown"] = true
    // console.log(file)
    socket.emit('update', files[data["session_num"]]);
  });

  socket.on('submit', function (data) {
    if (files[data["session_num"]]["num_symbols"] <= 2 && files[data["session_num"]]["num_symbols"] > 0) {
      socket.emit("submit_success", files[data["session_num"]])
      files[data["session_num"]]["turn"] = "receiver"
      files[data["session_num"]]["num_symbols"] = 0
      files[data["session_num"]]["show_signal"] = true
    } else {
      socket.emit("submit_failure", files[data["session_num"]])
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
    socket.emit('update', files[data["session_num"]]);
    socket.emit('show', JSON.stringify(files[data["session_num"]]));
  });

  socket.on('giveup', function (data) {
    fs.appendFile(fileName, JSON.stringify(files[data["session_num"]]) + "\n", function (err) {
      if (err) return console.log(err);
      console.log(JSON.stringify(files[data["session_num"]]));
      console.log('Writing to ' + fileName);
      socket.emit('update', files[data["session_num"]]);
    });
  });

  socket.on('click1', function (data) {
    if (files[data["session_num"]]["num_symbols"] < 2) {
      files[data["session_num"]]["trials"][files[data["session_num"]]["iter"]].push(1)
      files[data["session_num"]]["num_symbols"] += 1
    } else {
      socket.emit('show', "Too many symbols! Click 'submit' now.");
    }
  });

  socket.on('click2', function (data) {
    if (files[data["session_num"]]["num_symbols"] < 2) {
      files[data["session_num"]]["trials"][files[data["session_num"]]["iter"]].push(2)
      files[data["session_num"]]["num_symbols"] += 1
    } else {
      socket.emit('show', "Too many symbols! Click 'submit' now.");
    }
  });

  socket.on('click3', function (data) {
    if (files[data["session_num"]]["num_symbols"] < 2) {
      files[data["session_num"]]["trials"][files[data["session_num"]]["iter"]].push(3)
      files[data["session_num"]]["num_symbols"] += 1
    } else {
      socket.emit('show', "Too many symbols! Click 'submit' now.");
    }
  });

  socket.on('click4', function (data) {
    if (files[data["session_num"]]["num_symbols"] < 2) {
      files[data["session_num"]]["trials"][files[data["session_num"]]["iter"]].push(4)
      files[data["session_num"]]["num_symbols"] += 1
    } else {
      socket.emit('show', "Too many symbols! Click 'submit' now.");
    }
  });

  socket.on('update_heldout', function (data) {
    files[data["session_num"]]["heldout"] = data["heldout"];
    socket.emit('update', files[data["session_num"]]);
  });

  function get_accuracy(num, session_num) {
    // get accuracy % over last num trials
    counter = 0
    num_correct = 0
    val = files[session_num]["iter"] - 1
    while (counter < num && val >= 0) {
      console.log(val)
      if (files[session_num]["guesses"][val] == files[session_num]["objects"][val]) {
        num_correct += 1
      }
      counter += 1
      val = files[session_num]["iter"] - counter - 1
    }
    acc = num_correct/counter
    // socket.emit('show', acc.toString())
    return acc
  }

  function win(session_num) {
    fs.appendFile(fileName, JSON.stringify(files[session_num]) + "\n", function (err) {
      if (err) return console.log(err);
      console.log(JSON.stringify(files[session_num]));
      console.log('Writing to ' + fileName);
      socket.emit('update', files[session_num]);
    });
  }

  function new_iter(session_num) {
    files[session_num]["iter"] += 1;
    files[session_num]["trials"].push([])
    files[session_num]["turn"] = "sender";
    files[session_num]["object_shown"] = false;

    acc = get_accuracy(threshold, session_num)
    if (acc > 0.99 && files[session_num]["objects"].length > threshold) { 
      files[session_num]["game_over"] = true
      win(session_num)
    }
  }

  socket.on('guess', function (data) {
    if (files[data["session_num"]]["guesses"].length < files[data["session_num"]]["objects"].length) {
      files[data["session_num"]]["guesses"].push(data["val"])
    } else {
      socket.emit('show', "Too many guesses!");
    }
    new_iter(data["session_num"])
    socket.emit('update', files[data["session_num"]]);
  });

  socket.on('getJson', function (data) {
    // console.log("Calling getJson...")
    socket.emit('update', files[data["session_num"]]);
  });

  socket.on('disconnect', function() {
    delete file;
  });
});
