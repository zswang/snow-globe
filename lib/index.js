(function () {
    var math = Math;
    function bezier(path, rate) {
        var first = path[0];
        var second = path[1];
        switch (path.length) {
            case 1:
                return first;
            case 2:
                return {
                    x: first.x + (second.x - first.x) * rate,
                    y: first.y + (second.y - first.y) * rate,
                    z: first.z + (second.z - first.z) * rate
                };
            default:
                var temp = [];
                for (var i = 1; i < path.length; i++) {
                    temp.push(bezier([path[i - 1], path[i]], rate));
                }
                return bezier(temp, rate);
        }
    }
    function distance(a, b) {
        return math.sqrt(Math.pow((a.x - b.x), 2) + Math.pow((a.y - b.y), 2));
    }
    function toAngle(origin, point) {
        return math.atan2(point.y - origin.y, point.x - origin.x);
    }
    function projection(point, zOffset, distance) {
        return {
            x: (distance * point.x) / (point.z - zOffset),
            y: (distance * point.y) / (point.z - zOffset)
        };
    }
    var canvas = document.querySelector("canvas.snow-globe");
    if (!canvas) {
        return;
    }
    var context = canvas.getContext("2d");
    var globeRadius = 150;
    var particles = [];
    var maxParticles = 7000;
    var appendParticle = function () {
        var path = [];
        for (var i = 0; i < 5; i++) {
            path.push({
                x: -globeRadius + math.random() * globeRadius * 2,
                y: -globeRadius + math.random() * globeRadius * 2,
                z: -globeRadius + math.random() * globeRadius * 2
            });
        }
        var result = {
            lifetime: 5000 + math.random() * 15000,
            birthday: Date.now(),
            path: path
        };
        particles.push(result);
        return result;
    };
    var removeParticle = function (particle) {
        var index = particles.indexOf(particle);
        if (index >= 0) {
            particles.splice(index, 1);
        }
    };
    var renderParticle = function (particle) {
        if (Date.now() - particle.birthday > particle.lifetime) {
            removeParticle(particle);
            return;
        }
        var t = (Date.now() - particle.birthday) / particle.lifetime;
        var point3d = bezier(particle.path, t);
        var point = projection(point3d, 150, globeRadius);
        var d = distance({ x: 0, y: 0 }, point);
        if (d > globeRadius) {
            var a = toAngle({ x: 0, y: 0 }, point);
            point.x = math.cos(a) * globeRadius;
            point.y = math.sin(a) * globeRadius;
        }
        point.x += globeRadius + 10;
        point.y += globeRadius + 10;
        var r = math.min(math.max(math.floor(math.abs(point3d.z / globeRadius / 2) * 10), 3), 10);
        context.fillStyle = "rgba(255, 255, 255, " + (1 - (0.5 + t * 0.5)).toFixed(2) + ")";
        context.beginPath();
        context.arc(point.x, point.y, r, 0, 2 * math.PI);
        context.fill();
    };
    var render = function () {
        context.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(function (particle) {
            renderParticle(particle);
        });
    };
    for (var i = 0; i < 100; i++) {
        appendParticle();
    }
    var tick = Date.now();
    var next = function () {
        if (Date.now() - tick > 50) {
            if (particles.length < maxParticles) {
                for (var i = 0; i < 10; i++) {
                    appendParticle();
                }
            }
        }
        render();
        requestAnimationFrame(function () {
            next();
        });
    };
    next();
})();
