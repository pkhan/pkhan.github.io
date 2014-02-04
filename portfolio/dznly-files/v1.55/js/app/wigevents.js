define([
	'underscore',
	'backbone'
	],
function(underscore, Backbone) {
	var wigEvents = _.clone(Backbone.Events);
	wigEvents.debounceMap = {};
	wigEvents.onDebounce = function(eventName, cb) {
		var dbFunc = _.debounce(cb, 50);
		this.debounceMap[cb] = dbFunc;
		return this.on(eventName, dbFunc);
	};
	wigEvents.offDebounce = function(eventName, cb) {
		var dbFunc = this.debounceMap[cb];
		return this.off(eventName, dbFunc);
	};
	return wigEvents;
}
);