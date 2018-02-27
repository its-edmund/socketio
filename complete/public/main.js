(function () {

    function DrawingEngine(container, strokeStyle) {
        var _this = this;

        // Canvas setup
        this.drawingCanvas = document.createElement("canvas");
        this.drawingCanvas.setAttribute("id", "drawingCanvas");
        this.drawingCanvas.setAttribute("width", 600);
        this.drawingCanvas.setAttribute("height", 600);

        // Instance variables
        this.context = this.drawingCanvas.getContext('2d');
        this.strokeStyle = strokeStyle;
        this.isCurrentlyDrawing = false;
        this.previousPoint = null;

        this.afterLineDraw = function (previousPoint, currentPoint, strokeStyle) {
            // Set this function!
        };

        this.drawLine = function (previousPoint, currentPoint, strokeStyle) {
            // Set the line style
            _this.context.strokeStyle = strokeStyle;
            _this.context.lineJoin = "round";
            _this.context.lineWidth = 5;

            // Draw from the previous point to the next one
            _this.context.beginPath();
            _this.context.moveTo(previousPoint[0], previousPoint[1]);
            _this.context.lineTo(currentPoint[0], currentPoint[1]);
            _this.context.closePath();
            _this.context.stroke();
        };

        // Start drawing when clicked
        this.drawingCanvas.addEventListener('mousedown', function (e) {
            var mouseX = e.pageX - this.offsetLeft;
            var mouseY = e.pageY - this.offsetTop;

            // Begin drawing!
            _this.isCurrentlyDrawing = true;
            _this.previousPoint = [mouseX, mouseY];
        });

        // Keep drawing when dragged
        this.drawingCanvas.addEventListener('mousemove', function (e) {
            if (!_this.isCurrentlyDrawing) {
                return;
            }

            var mouseX = e.pageX - this.offsetLeft;
            var mouseY = e.pageY - this.offsetTop;
            var currentPoint = [mouseX, mouseY];
            _this.isCurrentlyDrawing = true;

            _this.drawLine(_this.previousPoint, currentPoint, _this.strokeStyle);

            _this.afterLineDraw(_this.previousPoint, currentPoint, _this.strokeStyle);

            _this.previousPoint = currentPoint;
        });

        // Stop drawing when released
        this.drawingCanvas.addEventListener('mouseup', function () {
            _this.isCurrentlyDrawing = false;
        });

        // Stop drawing when pointer leaves canvas
        this.drawingCanvas.addEventListener('mouseleave', function () {
            _this.isCurrentlyDrawing = false;
        });

        // Setup the container:
        var titleH1 = document.createElement("h1");
        titleH1.textContent = "Collaborative Drawing";
        var titleSmall = document.createElement("small");
        titleSmall.textContent = " (this is your color)";
        titleSmall.style.color = this.strokeStyle;

        titleH1.appendChild(titleSmall);

        container.appendChild(titleH1);
        container.appendChild(this.drawingCanvas);
    }

    var getNextStrokeStyle = function () {
        // Colors from: https://developer.apple.com/ios/human-interface-guidelines/visual-design/color/
        const availableStokeStyles = ["#ff3b30", "#ff9500", "#ffcc00", "#4cd964", "#5ac8fa", "#007aff", "#5856d6", "#0a2d55"];

        var now = new Date();
        var currentSecondSinceEpoch = Math.round(now.getTime() / 1000);
        var nextIndex = currentSecondSinceEpoch % availableStokeStyles.length;

        return availableStokeStyles[nextIndex];
    };

    window.addEventListener('load', function () {

        // Join the room
        var socket = io.connect(location.origin);
        if (!socket) {
            return;
        }

        var container = document.getElementById("container");
        var randomStokeStyle = getNextStrokeStyle();

        var engine = new DrawingEngine(container, randomStokeStyle);
        engine.afterLineDraw = function (previousPoint, currentPoint, strokeStyle) {
            socket.emit('I drew!', {
                previousPoint: previousPoint,
                currentPoint: currentPoint,
                strokeStyle: strokeStyle,
            });
        };


        socket.on('A friend drew!', function (data) {
            engine.drawLine(data.previousPoint, data.currentPoint, data.strokeStyle);
        });

        console.log('loaded');
    });

})();

