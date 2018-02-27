# NodeJS + SocketIO tutorial

## Handle users connecting and disconnecting
On the client's `main.js`:
```javascript
var container = document.getElementById("container");
var usersList = document.getElementById("users");

// Join the room
var socket = io.connect(location.origin);
if (!socket) {
    return;
}

var name = null;
while (!name) {
    name = prompt("What's your name? (required)");
}

var randomStokeStyle = getNextStrokeStyle();

var currentUser = {
    'name': name,
    'strokeStyle': randomStokeStyle,
};

addUserToUsersList(usersList, currentUser, true);

socket.on('A friend joined!', function (user) {
    updateUsersList(usersList)
});

socket.on('A friend left :(', function (user) {
    updateUsersList(usersList);
});

socket.emit('I joined!', currentUser);
```

On the server's `server.js`:
```javascript
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

    clientSocket.on('disconnect', function () {
        var user = users.filter(function (u) { return u.clientId === clientId; })[0];
        if (!user) {
            return;
        }
        user.active = false;

        clientSocket.broadcast.emit('A friend left :(');
    })

});

app.get('/users', function (req, res) {
    res.write(JSON.stringify(users.filter(function (u) { return u.active; })));
    res.end();
});

http.listen(3000, function () {
    console.log('listening on 3000');
});

```


## Add functionality for sending drawing information to others

On server's `server.js`:
```javascript
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
```

On client's `main.js`:
```javascript
var engine = new DrawingEngine(container, randomStokeStyle);
// When you draw on the screen, inform friends
engine.afterLineDraw = function (previousPoint, currentPoint, strokeStyle) {
    socket.emit('I drew!', {
        previousPoint: previousPoint,
        currentPoint: currentPoint,
        strokeStyle: strokeStyle,
    });
};

// When friend draws on their screen, inform me (this browser)
socket.on('A friend drew!', function (data) {
    engine.drawLine(data.previousPoint, data.currentPoint, data.strokeStyle);
});
```