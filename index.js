var express = require('express');
var app = express();
var forever = require('forever-monitor');


// CONFIG
var port = 9321;
var pulldir = '/home/diz/phoroneus'; // no ending slash
var mainfilename = 'index.js'; // name of file to be run


var executable = pulldir + '/' + mainfilename


// Forever childs
var pull = new (forever.Monitor)([ 'git', 'pull' ], {
	max: 1,
	cwd: pulldir
});

var npm = new (forever.Monitor)([ 'npm', 'install' ], {
  max: 1,
  cwd: pulldir
});

var child = new (forever.Monitor)(executable, {
	max: 10,
	silent: true,
	cwd: pulldir
});

pull.on('exit', function() {
    npm.start();
});

npm.on('exit', function() {
    child.restart();
});


child.on('restart', function() {
    console.error('Forever restarting app for ' + child.times + ' time');
});


child.start();




app.post('/hook', function (req, res) {
  res.sendStatus(200);

  pull.start();


});

var server = app.listen(port, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Git cloner listening', host, port)

})
