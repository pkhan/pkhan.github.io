define([
	'backbone'
	],
function(Backbone) {
	var BarView = Backbone.View.extend({
		tagName: 'div',
		events: {},
		initialize: function() {
			this.$el.addClass('bar-view');
			this.types = ['Text', 'Image', 'Interactive', 'Shapes'];
			this.active = [];
			this.barInit.apply(this, arguments);
		},
		barInit: function() {

		},
		show: function() {
			this.$el.css('display', 'inline-block');
			this.delegateEvents(this.events);
		},
		hide: function() {
			this.$el.hide();
			this.undelegateEvents();
		},
		setActive: function(active) {
			this.active = active;
		},
		afterDOM: function() {

		}
	});
	return BarView;
}
);