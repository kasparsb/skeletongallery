var $;

var u = {

    /**
     * Set jQuery object.
     * Even in CommonJs modules there can be case when jQuery cant be loaded
     * as module
     * In case of Wordpress it should be as extrernal dependency
     */
    jQuery: function(jQuery) {
        $ = jQuery;
    },

    /**
     * Bind function execution to provided scope
     */
    bind: function(func, scope) {
        return function(){
            return func.apply(scope, arguments);
        }
    },

    clone: function(obj) {
        var n = {};
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                n[i] = obj[i];
            }
        }
        return n;
    },

    /**
     * Delay function execution by delay milisecond
     * @param function Function
     * @param number Delay
     * @param object Function scope
     */
    delay: function(cb, delay, scope) {
        delay = delay || 0;

        if (scope) {
            cb = this.bind(cb, scope);
        }
        window.setTimeout(cb, delay);
    },

    /**
     * Debounce function execution
     */
    debounce: function(cb, delay, scope) {
        var t = 0;
        return function() {
            window.clearTimeout(t);
            t = window.setTimeout(function(){
                cb.apply(scope)
            }, delay)
        }
    },

    /**
     * Izpildām funkciju noteiktu skaitu reižu
     */
    times: function(cb, times, scope) {
        for (var i = 0; i < times; i++) {
            cb.apply(scope, [i]);
        }
    },

    /**
     * Palaižam doneCallback, pēc tam, kad atgrieztā 
     * funkcija palaista count reizes
     */
    after: function(count, doneCallback) {
        var counter = 0;
        return function() {
            counter++;
            if (counter == count) {
                doneCallback();
            }
        }
    },

    each: function(items, cb, scope) {
        scope = scope || this;
        for (var i in items) {
            if (cb.apply(scope, [items[i]]) === false) {
                break;
            }
        }
    },

    /**
     * Ģenerējam range masīvu, kura vērtības ir padotā 
     * callback atgrieztā vērtība.
     * Padotajam callback tiek padots items no range masīva
     * Ja ir padots callback, tad izsaucam to uz katru item range masīvā
     * @param number Range start
     * @param number Range stop
     * @param function Callback, ko izsauks uz katru item range masīvā
     * @param object Scope, uz kuru izpildīt callback
     */
    ranger: function(start, stop, cb, scope) {
        if (stop == null) {
            stop = start || 0;
            start = 0;
        }
        // Ja stop ir mazāks par start, tad step ir -1
        step = (stop < start ? -1 : 1);
        scope = scope || this;

        var length = Math.max(Math.ceil((stop - start) / step), 0);
        var range = Array(length);

        for (var i = 0; i < length; i++, start += step) {
            if (typeof cb == 'function') {
                range.push(cb.call(scope, start));
            }
        }

        return range;
    },

    /**
     * Normalizējam masīva indeksu
     * Ja indekss ir lielāks vai mazāks par masīva length, tad uzskatām, ka
     * tas loopojas pa masīvu, kamēr atrod savu vietu
     */
    normalizeIndex: function(index, length) {
        index = index % length;
        return index < 0 ? length + index : index;
    },

    /**
     * You should not slice on arguments because it prevents optimizations in JavaScript 
     * engines (V8 for example). Instead, try constructing a new array by iterating 
     * through the arguments object.
     * @url https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments
     */
    getArguments: function(offset, argumentObj) {
        var a = [];
        for (var i = offset; i < argumentObj.length; i++) {
            a.push(argumentObj[i]);
        }
        return a;
    },

    /**
     * Check if provided number is not less than 0 and not bigger then max
     * If less then 0, then 0
     * If bigger then max, then max
     * When reStart is true, then when reached max turn varianle into 0
     * and if less then 0, then turn into max
     */
    checkBoundry: function(i, max, reStart) {
        if (i < 0) {
            i = reStart ? max-1 : 0;
        }
        else if (i >= max) {
            i = reStart ? 0 : max-1;
        }

        return i;
    },

    
    /**
     * Visas šīs metode pārtaisīt bez jQuery
     */
    addClass: function(el, className) {
        $(el).addClass(className);
    },

    removeClass: function(el, className) {
        $(el).removeClass(className);
    },

    append: function(target, el) {
        $(el).appendTo(target);
    },

    remove: function(el) {
        $(el).remove();
    },

    createEl: function(tagName) {
        return $('<'+tagName+'/>').get(0);
    },

    css: function(el, css) {
        $(el).css(css);
    },

    attr: function(el, name, value) {
        $(el).attr(name, value);
    },

    width: function(el) {
        return $(el).width();
    },

    outerWidth: function(el) {
        return $(el).outerWidth();
    },

    height: function(el) {
        return $(el).height();
    },

    on: function(el, eventName, callback) {
        $(el).on(eventName, callback);
    },

    extend: function(a, b) {
        return $.extend(a, b);
    },

    data: function(el, name, data) {
        if (typeof data != 'undefined') {
            $(el).data(name, data);
        }
        else {
            return $(el).data(name);
        }
    }
}

module.exports = u;