define([
	'underscore',
	'backbone',
	'app/wigevents'
	],
function(_, Backbone, wigEvents) {
	var CommandBar = Backbone.View.extend({
		tagName: 'div',
		className: 'brick-bar',
		initialize: function() {
			var commandBar = this;
			this.bars = [];
			this.dom = false;
			this.listenTo(wigEvents, 'activechange', function(active){
				commandBar.showBars(active);
			});
		},
		addBar: function(bar, isDefault) {
			bar.parent = this;
			bar.render().hide();
			if(!isDefault) {
				this.bars.push(bar);
				// this.$el.append(bar.el);
			} else {
				this.defaultBar = bar;
				// this.$el.prepend(bar.el);
			}
			if(this.$el.has(bar.el).length === 0) {
				this.$el.append(bar.el);
			}
			if(this.dom) {
				bar.afterDOM();
			}
		},
		showBars: function(active) {
			if(active.length === 0) {
				this.defaultBar.show();
				this.defaultBar.setActive(active);
				_.each(this.bars, function(bar) {
					bar.hide();
				});
				return;
			}
			_.each(this.bars, function(bar){
				bar.hide();
			});
			var types = _.map(active, function(pb) {
				return pb.get('category');
			}),
			bars = _.clone(this.bars),
			notBars;
			_.each(types, function(type) {
				bars = _.filter(bars, function(bar) {
					return _.indexOf(bar.types, type) > -1;
				});
			});
			notBars = _.difference(bars);
			_.each(notBars, function (notBar) {
				notBar.hide();
			});
			_.each(bars, function (bar) {
				bar.show();
				bar.setActive(active);
			});
			if(bars.length === 0) {
				this.defaultBar.show();
				this.defaultBar.setActive(active);
			} else {
				this.defaultBar.hide();
			}
		},
		showNamedBar: function(name) {
			var match = false;
			_.each(this.bars, function(bar) {
				if(bar.name === name) {
					bar.show();
					match = true;
				} else {
					bar.hide();
				}
			});
			if(match) {
				this.defaultBar.hide();
			}
		},
		domInserted: function() {
			this.dom = true;
			_.each(this.bars, function(bar) {
				bar.afterDOM();
			});
			this.defaultBar.afterDOM();
		}
	});

	return CommandBar;
}
);