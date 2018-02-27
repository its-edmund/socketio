var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Instance variables
var users = [];

io.sockets.on('connection', function (clientSocket) {

    var clientId = clientSocket.id;

    clientSocket.on('I joined!', function (data) {
        var user = {
            name: data.name,
            strokeStyle: data.strokeStyle,
            clientId: clientId,
            active: true,
        };

        users.push(user);

        clientSocket.broadcast.emit('A friend joined!');
        clientSocket.emit('A friend joined!');
    });

    clientSocket.on('I drew!', function (data) {
        var previousPoint = data.previousPoint;
        var currentPoint = data.currentPoint;
        var strokeStyle = data.strokeStyle;

        clientSocket.broadcast.emit('A friend drew!', {
            previousPoint: previousPoint,
            currentPoint: currentPoint,
            strokeStyle: strokeStyle,
        });
    });

    clientSocket.on('disconnect', function () {
        var user = users.filter(function (u) { return u.clientId === clientId; })[0];
        if (!user) {
            return;
        }
        user.active = false;

        clientSocket.broadcast.emit('A friend left :(');
    })

});

app.use(express.static('public/'));

app.get('/users', function (req, res) {
    res.write(JSON.stringify(users.filter(function (u) { return u.active; })));
    res.end();
});

http.listen(3000, function () {
    console.log('listening on 3000');
});
