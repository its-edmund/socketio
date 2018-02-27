var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

io.sockets.on('connection', function (socket) {

    socket.on('I drew!', function (data) {
        var previousPoint = data.previousPoint;
        var currentPoint = data.currentPoint;
        var strokeStyle = data.strokeStyle;

        socket.broadcast.emit('A friend drew!', {
            previousPoint: previousPoint,
            currentPoint: currentPoint,
            strokeStyle: strokeStyle,
        });
    });

});

app.use(express.static('public/'));

http.listen(3000, function () {
    console.log('listening on 3000');
});
