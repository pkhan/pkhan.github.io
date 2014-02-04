define([
	'underscore',
	'app/models/slide'
	],
function(_, Slide){
	var SiteSlide = Slide.extend({
		defaults: function() {
			var def = _.clone(Slide.prototype.defaults);
			_.extend(def, {
				name: 'Global Slide',
				slide_type: 'Header', //Header, Footer, or Middle
				has_content: false
			});
			return def;
		},
		toJSON: function() {
			var out = Slide.toJSON.apply(this);
			if(!out.has_content) {
				out.bricks = [];
			}
		}

	});

	return SiteSlide;
}
);