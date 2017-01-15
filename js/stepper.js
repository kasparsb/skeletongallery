var Bezier = require('./bezier2.js');

var Stepper = function() {
    this.defaultBezierCurve = [0,0,1,1];
    this.precision = 10000000;
    this.progress = 0;
    this.current = 0;
}

Stepper.prototype = {
    run: function(duration, bezierCurve, stepCb, doneCb) {
        this.stepCallback = stepCb;
        this.doneCallback = doneCb

        this.easing = this.getEasing(bezierCurve);

        this.duration = isNaN(duration) ? 0 : duration;
        this.current = 0;

        this.start();
        this.step();
    },

    /**
     * Run from given progress
     */
    runFrom: function(progress, duration, bezierCurve, stepCb, doneCb) {
        this.stepCallback = stepCb;
        this.doneCallback = doneCb

        this.easing = this.getEasing(bezierCurve);
        
        this.duration = duration;

        this.startTime = +new Date();
        this.startTime -= (duration * progress);
        this.progress = progress;

        //log('stepper.runFrom.startTime', this.startTime);

        this.step();
    },

    /**
     * Piefiksējam sākuma laiku
     */
    start: function() {
        this.startTime = +new Date();
        this.progress = 0;
    },

    done: function() {
        this.doneCallback();
    },

    step: function() {
        var mthis = this;


        // if (this._prevTime) {
        //     log('stepper.step', Math.round(window.performance.now() - this._prevTime));
        // }
        // this._prevTime = window.performance.now();


        mthis.trackProgress();

        if (this.current < this.startTime + this.duration) {

            this.stepCallback(this.progress);

            requestAnimationFrame(function(){
                mthis.step()
            });
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
    },

    getEasing: function(bezierCurve) {
        if (!(bezierCurve && bezierCurve.length && bezierCurve.length == 4)) {
            bezierCurve = this.defaultBezierCurve;
        }
        return new Bezier(bezierCurve[0], bezierCurve[1], bezierCurve[2], bezierCurve[3]);
    }
}

module.exports = Stepper;