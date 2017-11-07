# Socket.io Tutorial

## 01: Initial Server Setup
```
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public/'));

http.listen(3000, function() {
  console.log('listening on 3000');
});
```

## 02: Initial Client Setup
```
(function() {
  function startup() {

  }

  window.addEventListener('load', startup);
})();
```

## 03: Drawing on the client
```
    // Drawing stuff
    var clickX = [], clickY = [], clickDrag = [];
    var paint = false;
    var canvas = document.getElementById('mycanvas');
    var context = canvas.getContext('2d');

    // Socket.io
    var socket;

    canvas.setAttribute("width", 600);
    canvas.setAttribute("height", 600);

    // Start drawing when clicked
    canvas.addEventListener('mousedown', function(e) {
      var mouseX = e.pageX - this.offsetLeft;
      var mouseY = e.pageY - this.offsetTop;

      paint = true;
      addClick(mouseX, mouseY);
      redraw();
    });

    // Keep drawing when dragged
    canvas.addEventListener('mousemove', function(e) {
      if (paint) {
        var mouseX = e.pageX - this.offsetLeft;
        var mouseY = e.pageY - this.offsetTop;

        addClick(mouseX, mouseY, true);
        redraw();
      }
    });

    // Stop drawing when released
    canvas.addEventListener('mouseup', function() {
      paint = false;
    });

    // Stop drawing when pointer leaves canvas
    canvas.addEventListener('mouseleave', function() {
      paint = false;
    });

    // Record a pixel
    function addClick(x, y, dragging, fromServer) {
      clickX.push(x);
      clickY.push(y);
      clickDrag.push(dragging);
    }

    // Draw entire screen
    function redraw() {
      context.clearRect(0, 0, canvas.width, canvas.height);

      context.strokeStyle = "#df4b26";
      context.lineJoin = "round";
      context.lineWidth = 5;

      for (var i = 0; i < clickX.length; i++) {
        context.beginPath();
        if (clickDrag[i] && i) {
          context.moveTo(clickX[i-1], clickY[i-1]);
        } else {
          context.moveTo(clickX[i]-1, clickY[i]);
        }
        context.lineTo(clickX[i], clickY[i]);
        context.closePath();
        context.stroke();
      }
    }
```

## 04: Init on server
```
var clickX = [], clickY = [], clickDrag = [];

io.sockets.on('connection', function(socket) {
  socket.emit('initCanvas', {
  	clickX: clickX,
  	clickY: clickY,
  	clickDrag, clickDrag
  });

});
```

## 05: Connect Sockets on Client
```
    var socket = io.connect(location.origin);
    if (socket) {
      socket.on('initCanvas', function(data) {
        clickX = data.clickX;
        clickY = data.clickY;
        clickDrag = data.clickDrag;
        redraw();
      });

    }
```

## 06: Emit an Event from the Client
```
    function addClick(x, y, dragging, fromServer) {
      // ...

      if (!fromServer && socket) {
        socket.emit('addClick', {
          x: x,
          y: y,
          dragging: dragging
        });
      }
    }
```

## 07: Receive event of server and emit update
```
io.sockets.on('connection', function(socket) {
  // ...

  socket.on('addClick', function(data) {
  	clickX.push(data.x);
  	clickY.push(data.y);
  	clickDrag.push(data.dragging);

    socket.broadcast.emit('draw', {
      x: data.x,
      y: data.y,
      dragging: data.dragging
    });
  });
});
```

## 08: Receive event on the Client
```
    if (socket) {
      // ...

      socket.on('draw', function(data) {
        addClick(data.x, data.y, data.dragging, true);
        redraw();
      });
    }
```
