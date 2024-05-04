var c = document.getElementById("canv");
var starsCanvas = document.getElementById("stars");
var ctx = c.getContext("2d");
var starsCtx = starsCanvas.getContext("2d");

var w = window.innerWidth;
var h = window.innerHeight;
c.width = w;
c.height = h;
starsCanvas.width = w;
starsCanvas.height = h;

var bubble = 100; // Decreased bubble size
var cells = 50; // Define the size of cells

function Cell(p1, p2, p3, p4) {
    var lingelbach  = this;
    lingelbach.draw = function($) {
        $.strokeStyle = 'hsla(255,255%,255%,.2)';
        $.fillStyle = 'hsla(255,255%,255%,1)';
        $.beginPath();
        $.arc(p1.x, p1.y, 2, 0, Math.PI * 2, false);
        $.fill();
        $.lineWidth = 2;
        $.moveTo(p1.x + 0.5, p1.y + 0.5);
        $.lineTo(p2.x - 0.5, p2.y + 0.5);
        $.lineTo(p3.x - 0.5, p3.y - 0.5);
        $.lineTo(p4.x + 0.5, p4.y - 0.5);
        $.closePath();
        $.stroke();
    };
}

function Grid($, w, h) {
    var lingelbach = this;
    lingelbach.ms = null;

    var col = ((w - 1) / cells | 0) + 1;
    var row = ((h - 1) / cells | 0) + 1;
    var bubbleXL = 1 / (bubble * bubble);
    var diam = [{
        x: -1,
        y: 0
    }, {
        x: 0,
        y: -1
    }, {
        x: 1,
        y: 0
    }, {
        x: 0,
        y: 1
    }];

    var pts = [];
    var sqs = [];

    var pindx = function(x, y) {
        if (0 <= x && x < col + 1 && 0 <= y && y < row + 1) {
            return x + y * (col + 1);
        } else {
            return null;
        }
    };

    var cindx = function(x, y) {
        if (0 <= x && x < col && 0 <= y && y < row) {
            return x + y * col;
        } else {
            return null;
        }
    };

    for (var x = 0; x < col + 1; x++) {
        for (var y = 0; y < row + 1; y++) {
            var px = x * cells;
            var py = y * cells;
            pts[pindx(x, y)] = new Part(px, py);

            if (x > 0 && y > 0) {
                var idxc = cindx(x - 1, y - 1);
                var p1 = pts[pindx(x - 1, y - 1)];
                var p2 = pts[pindx(x, y - 1)];
                var p3 = pts[pindx(x, y)];
                var p4 = pts[pindx(x - 1, y)];
                var cell = new Cell(p1, p2, p3, p4);
                sqs[idxc] = cell;
            }
        }
    }
    lingelbach.struct = function() {
        for (var x = 0; x < col + 1; x++) {
            for (var y = 0; y < row + 1; y++) {
                var p = pts[pindx(x, y)];

                var cnt = 1;
                var msX = x * cells;
                var msY = y * cells;
                for (var i = 0; i < diam.length; i++) {
                    var dp = diam[i];
                    var cp = pts[pindx(x + dp.x, y + dp.y)];
                    if (cp != null) {
                        msX += cp.x - dp.x * cells;
                        msY += cp.y - dp.y * cells;
                        cnt++;
                    }
                }
                p.vx += (msX / cnt - p.x) * 0.6;
                p.vy += (msY / cnt - p.y) * 0.6;

                if (lingelbach.ms != null) {
                    var d2 = (lingelbach.ms.x - p.x) * 
                        (lingelbach.ms.x - p.x) +
                        (lingelbach.ms.y - p.y) * 
                        (lingelbach.ms.y - p.y);
                    if (d2 * bubbleXL < 1.0) {
                        var t = 1.0 - (d2 * bubbleXL);
                        p.vx += (lingelbach.ms.x - p.x) * t * 2; // Inverted direction
                        p.vy += (lingelbach.ms.y - p.y) * t * 2; // Inverted direction
                    }
                }
            }
        }

        for (var x = 0; x < col + 1; x++) {
            for (var y = 0; y < row + 1; y++) {
                var p = pts[pindx(x, y)];
                p.anim();
            }
        }
    };

    lingelbach.draw = function($) {
        $.clearRect(0, 0, w, h);
        for (var i = 0; i < sqs.length; i++) {
            sqs[i].draw($);
        }
    };
}
function Part(px, py) {
    var lingelbach = this;
    lingelbach.x = px;
    lingelbach.y = py;
    lingelbach.vx = 0;
    lingelbach.vy = 0;

    lingelbach.anim = function() {
        lingelbach.x += lingelbach.vx;
        lingelbach.y += lingelbach.vy;
        lingelbach.vx *= 0.9;
        lingelbach.vy *= 0.9;
    };
}

var grid = new Grid(ctx, w, h);

window.addEventListener('mousemove', function(e) {
    grid.ms = {
        x: e.clientX,
        y: e.clientY,
    };
}, false);

window.addEventListener('touchmove', function(e) {
    e.preventDefault();
    grid.ms = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
    };
}, {passive: false}); // Set passive option to false

function load() {
    grid.struct();
    grid.draw(ctx);
    window.requestAnimationFrame(load);
};
load();

// Stars
var numStars = 1000;
var stars = [];
for (var i = 0; i < numStars; i++) {
    stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: Math.random(),
        opacity: Math.random()
    });
}

function drawStars() {
    starsCtx.clearRect(0, 0, w, h);
    for (var i = 0; i < numStars; i++) {
        var star = stars[i];
        starsCtx.beginPath();
        starsCtx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
        starsCtx.fillStyle = 'rgba(255, 255, 255, ' + star.opacity + ')';
        starsCtx.fill();
    }
}

function updateStars() {
    for (var i = 0; i < numStars; i++) {
        var star = stars[i];
        star.x += (Math.random() - 0.5) * 0.1;
        star.y += (Math.random() - 0.5) * 0.1;

        if (star.x < 0 || star.x > w) {
            star.x = Math.random() * w;
        }

        if (star.y < 0 || star.y > h) {
            star.y = Math.random() * h;
        }
    }
}

function animateStars() {
    drawStars();
    updateStars();
    requestAnimationFrame(animateStars);
}

animateStars();