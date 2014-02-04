define([
	'app/models/slide'
	],
function(Slide) {
	var Template = Slide.extend({
		urlRoot: '/api/v1/slides/',
        initialize: function() {
            Slide.prototype.initialize.call(this);
            this.set('is_template', true);
        },
		toJSON: function() { 
			return Backbone.Model.prototype.toJSON.apply(this);
		}
	});
	return Template;
}
);