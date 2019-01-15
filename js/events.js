var _ = require('underscore2');

/**
 * Vienots callback reģistrs visiem objektiem
 */
var registeredCallbacks = {};

var events = {
	on: function(eventName, callback) {		
		eventName = this.normalizeEventName(eventName);
		if (typeof registeredCallbacks[eventName] == 'undefined') {
			registeredCallbacks[eventName] = [];
		}
		registeredCallbacks[eventName].push(callback)
	},

	trigger: function(eventName) {
		var listeners = this.getListeners(eventName);
		for (var i in listeners) {
			listeners[i].apply(this, _.getArguments(1, arguments))
		}
	},

	/**
	 * Izpildām visus listeners un, kad tie visi izpildījušies
	 * un izpildījuši doneCallback, tad izpildās padoto doneCallback
	 */
	triggerWithCallback: function(eventName, doneCallback) {
		var listeners = this.getListeners(eventName);

		/**
		 * callback, kuru jāizsauc katram listener. Kad šis callback būs
		 * izsaukts listeners.length reizes, tad tiks izpildīts doneCallback
		 */
		var done = _.after(listeners.length, doneCallback);

		// Pirmo argumentu padodam done callback funkciju
		var args = _.getArguments(2, arguments);
		args.unshift(done);

		for (var i in listeners) {
			listeners[i].apply(this, args)
		}
	},

	/**
	 * Trigger only first attached event
	 */
	triggerFirst: function(eventName) {
		var listeners = this.getListeners(eventName);

		if (listeners.length > 0) {
			listeners[0].apply(this, _.getArguments(1, arguments))
		}
	},

	getListeners: function(eventName) {
		eventName = this.normalizeEventName(eventName);
		if (typeof registeredCallbacks[eventName] != 'undefined') {
			return registeredCallbacks[eventName];
		}
		return [];
	},

	/**
	 * Vai ir eventName piesaistīti klausītāji
	 */
	isListeners: function(eventName) {
		return this.getListeners(eventName).length > 0;
	},

	/**
	 * Katram eventam jāsākas ar klases vārdu
	 * Ja tas nav norādīts, tad kā klases vārdu ņemam this.name
	 */
	normalizeEventName: function(eventName) {
		var p = eventName.split('.');
		if (p.length == 1) {
			p.unshift(this.name);
		}
		return p.join('.');
		
	}
}

module.exports = events;