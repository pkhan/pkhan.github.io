define([
	'backbone',
	'app/wigevents'
	],
function(Backbone, wigEvents) {
	var WigModel = Backbone.Model.extend({
		save: function() {
			var xhr = Backbone.Model.prototype.save.apply(this, arguments);
			wigEvents.trigger('savestart', this);
			xhr.done(function() {
				wigEvents.trigger('savecomplete');
			});
			xhr.fail(function() {
				wigEvents.trigger('savefail');
			});
		}
	});
	// Backbone.Model.prototype.oldSave = Backbone.Model.prototype.save;
	// Backbone.Model.prototype.save = function() {
	// 	var xhr = this.oldSave.apply(this, arguments);
	// 	wigEvents.trigger('savestart', this);
	// 	xhr.always(function() {
	// 		wigEvents.trigger('savecomplete');
	// 	});
	// };

	return {Model : WigModel};
}
);