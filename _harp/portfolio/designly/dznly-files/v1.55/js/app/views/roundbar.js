define([
	'underscore',
	'backbone',
	'app/views/barview',
	'app/wigevents'
	],
function(_, Backbone, BarView, wigEvents) {

	var RoundBar = BarView.extend({
		el: '.round-controls',
		events: {
			'click .decrease-radius': function(evt) {
				this.changeRadius(-5);
			},
			'click .increase-radius': function(evt) {
				this.changeRadius(5);
			},
			'submit #radius-form' : function(evt) {
				evt.preventDefault();
				this.changeRadiusTo(this.$radiusBox.val());
			}
		},
		barInit: function() {
			this.types = ['Shapes', 'Image'];
		},
		setActive: function(active) {
			this.active = active;
			if(_.some(active, function(pb){
				return pb.get('name') === 'Circle';
			})) {
				this.$el.hide();
			} else {
				var radii = _.uniq(_.map(active, function(pb) {
					return pb.view.$content.css('border-radius');
				}));
				if(radii.length === 1) {
					this.$radiusBox.val('')
					.attr('placeholder', radii[0].replace('px',''));
				} else {
					this.$radiusBox.val('')
					.attr('placeholder', '');
				}
			}
		},
		changeRadiusTo: function(radius) {
			if(radius >= 0) {
				_.each(this.active, function(pb) {
					if(pb.get('name') === 'Square' || pb.get('name') === 'Image') {
						pb.view.$content.css({
							'border-radius': radius + 'px'
						});
					}
				});
				this.logUndo();
			}
		},
		changeRadius: function(diff) {
			var min = 0,
			max = 1000,
			changed = 0,
			radii = [];
			_.each(this.active, function(pb) {
				var radius = 0,
				borderRadiusVal;
				if(pb.get('name') === 'Square' || pb.get('name') === 'Image') {
					borderRadiusVal = pb.view.$content.css('border-radius');
					if(borderRadiusVal) {
						radius = Number(borderRadiusVal.replace('%','').replace('px',''));
					}
					radius += diff;
					radius = _.min([radius, max]);
					radius = _.max([radius, min]);
					pb.view.$content.css({
						'border-radius' : radius + 'px'
					});
					changed++;
					radii.push(radius);
				}
			});
			if(changed > 0) {
				this.logUndo();
				radii = _.uniq(radii);
				if(radii.length === 1) {
					this.$radiusBox.val('')
					.attr('placeholder', radii[0]);
				}
			}
		},
		logUndo: _.debounce(function() {
			wigEvents.trigger('changepoint', 'Round Corners');
			wigEvents.trigger('stylechange', ['Square'], {
				'border-radius' : this.active[0].view.$content.css('border-radius')
			});
		}, 1500),
		render: function() {
			this.$radiusBox = this.$('.radius-box');
			return this;
		}
	});

	return RoundBar;
});