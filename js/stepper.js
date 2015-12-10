var Bezier = require('./bezier2.js');

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
    run: function(duration, bezierCurve, stepCb, doneCb) {
        this.stepCallback = stepCb;
        this.doneCallback = doneCb

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
        this.doneCallback();
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

module.exports = Stepper;