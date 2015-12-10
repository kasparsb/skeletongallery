var KeySpline = function(mX1, mY1, mX2, mY2) {

    this.get = function(aX) {
        if (mX1 == mY1 && mX2 == mY2) {
            return aX; // linear
        }
        return CalcBezier(GetTForX(aX), mY1, mY2);
    }

    function A(aA1, aA2) {
        return 1.0 - 3.0 * aA2 + 3.0 * aA1;
    }
    function B(aA1, aA2) {
        return 3.0 * aA2 - 6.0 * aA1;
    }
    function C(aA1) {
        return 3.0 * aA1;
    }

    // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
    function CalcBezier(aT, aA1, aA2) {
        return ((A(aA1, aA2)*aT + B(aA1, aA2))*aT + C(aA1))*aT;
    }

    // Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
    function GetSlope(aT, aA1, aA2) {
        return 3.0 * A(aA1, aA2)*aT*aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
    }

    function GetTForX(aX) {
        // Newton raphson iteration
        var aGuessT = aX;
        for (var i = 0; i < 4; ++i) {
            var currentSlope = GetSlope(aGuessT, mX1, mX2);
            if (currentSlope == 0.0) {
                return aGuessT
            }
            var currentX = CalcBezier(aGuessT, mX1, mX2) - aX;
            aGuessT -= currentX / currentSlope;
        }
        return aGuessT;
    }
}





var Bezier = function(p1x, p1y, p2x, p2y) {
    // Calculate the polynomial coefficients, implicit first and last control points are (0,0) and (1,1).
    var cx = 3.0 * p1x;
    var bx = 3.0 * (p2x - p1x) - cx;
    var ax = 1.0 - cx -bx;
         
    var cy = 3.0 * p1y;
    var by = 3.0 * (p2y - p1y) - cy;
    var ay = 1.0 - cy - by;

    var epsilon = 0.00001;

    function sampleCurveDerivativeX(t) {
        return (3.0 * ax * t + 2.0 * bx) * t + cx;
    }

    function sampleCurveX(t) {
        // `ax t^3 + bx t^2 + cx t' expanded using Horner's rule.
        return ((ax * t + bx) * t + cx) * t;
    }

    function sampleCurveY(t) {
        return ((ay * t + by) * t + cy) * t;
    }

    // Given an x value, find a parametric value it came from.
    function solveCurveX(x)
    {
        var t0, t1, t2, x2, d2, i;

        // First try a few iterations of Newton's method -- normally very fast.
        for (t2 = x, i = 0; i < 8; i++) {
            x2 = sampleCurveX(t2) - x;
            if (Math.abs(x2) < epsilon) {
                return t2;
            }
            d2 = sampleCurveDerivativeX(t2);
            if (Math.abs(d2) < 1e-6) {
                break;
            }
            t2 = t2 - x2 / d2;
        }

        // Fall back to the bisection method for reliability.
        t0 = 0.0;
        t1 = 1.0;
        t2 = x;

        if (t2 < t0) {
            return t0;
        }
        if (t2 > t1) {
            return t1;
        }

        while (t0 < t1) {
            x2 = sampleCurveX(t2);
            if (Math.abs(x2 - x) < epsilon) {
                return t2;
            }
            if (x > x2) {
                t0 = t2;
            }
            else {
                t1 = t2;
            }
            t2 = (t1 - t0) * .5 + t0;
        }

        // Failure.
        return t2;
    }

    this.get = function(x) {
        return sampleCurveY(solveCurveX(x));
    }
}





var Stepper = function() {
    /**
     * Frames per second
     */
    this.fps = 100;
    this.precision = 100000;
    this.progress = 0;
    this.current = 0;
}

Stepper.prototype = {
    run: function(duration, bezierCurve, cb) {
        this.stepCallback = cb;

        //this.easing = new KeySpline(bezierCurve[0], bezierCurve[1], bezierCurve[2], bezierCurve[3]);
        this.easing = new Bezier(bezierCurve[0], bezierCurve[1], bezierCurve[2], bezierCurve[3]);
        

        this.duration = duration;
        this.current = 0;

        this.start();
        this.step();
    },

    /**
     * Piefiksējam sākuma laiku
     */
    start: function() {
        this.startTime = +new Date();
        this.progress = 0;

        this.interval = 1000 / this.fps;
    },

    done: function() {
        console.log('done', this);
    },

    step: function() {
        var mthis = this;

        mthis.trackProgress();

        if (this.current < this.startTime + this.duration) {

            this.stepCallback(this.progress);

            var cb = function(){
                mthis.step()
            }

            requestAnimationFrame(cb);
            //setTimeout(cb, this.interval);
        }
        else {
            this.stepCallback(1);

            this.done();
        }
    },

    trackProgress: function() {
        // Current time
        this.current = +new Date();

        var delta = this.current - this.startTime;

        // Animation progress in precents
        this.progress = this.easing.get(delta / this.duration);

        this.progress = Math.round(this.progress*this.precision)/this.precision;
    }
}






var right = 500;

var el = document.getElementById('el');
var el2 = document.getElementById('el2');
var el3 = document.getElementById('el3');
var el4 = document.getElementById('el4');

var curve = [.51,.01,1,.51];

var s = new Stepper();
s.run(5000, curve, function(progress){
    el.style.transform = 'translate('+(right*progress)+'px, 0)';
});


var s2 = new Stepper();
s2.run(2000, curve, function(progress){
    el2.style.transform = 'translate('+(right*progress)+'px, 0)';
})

var s3 = new Stepper();
s3.run(1000, curve, function(progress){
    el3.style.transform = 'translate('+(right*progress)+'px, 0)';
})

var s4 = new Stepper();
s4.run(500, curve, function(progress){
    el4.style.transform = 'translate('+(right*progress)+'px, 0)';
})







