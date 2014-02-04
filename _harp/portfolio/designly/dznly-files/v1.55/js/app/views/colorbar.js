define([
	'underscore',
	'jquery',
	'app/views/barview',
	'app/wigevents'
	],
function(_, $, BarView, wigEvents) {

	var dbEventer = _.debounce(function() {
		wigEvents.trigger('changepoint', 'Change Color');
	}, 700);

	var ColorBar = BarView.extend({
		el: '.color-controls',
		events: {
			'click .change-active-color' : function(evt) {
				evt.stopPropagation();
				this.changeColor();
				$('.brick-bar').trigger('savesel');
			}
		},
		barInit: function() {
			this.types = ['Shapes', 'Text'];
		},
		changeColor: function() {
			var cb = this;
			var initColor = '';
			if(this.active.length > 0) {
				if(this.active[0].view.editing) {
					try {
						initColor = document.queryCommandValue('foreColor');
					} catch(e) {}
				} else {
					var category = this.active[0].get('category');
					if(category === 'Text') {
						initColor = this.active[0].view.$content.css('color');
					} else if(category === 'Shapes') {
						initColor = this.active[0].view.$content.css('background-color');
					}
				}
			}
			wigEvents.trigger('pickcolor', this.$el, 'fixed', initColor);
			wigEvents.on('colorpicked', function(hex) {
				cb.receiveColor(hex);
			});
		},
		receiveColor: function(hex) {
			_.each(this.active, function(pb) {
				var category = pb.get('category');
				if(category === 'Shapes') {
					pb.view.$content.css({
						'background-color' : hex
					});
					wigEvents.trigger('stylechange', 'Shapes', {
						'background-color' : hex
					});
				} else if(category === 'Text') {
					if(pb.view.editing) {
						pb.view.$content.trigger('command', 'foreColor ' + hex);
						pb.view.$content.find('font>a').each(function() {
							var $a = $(this),
							$f = $a.parent();
							$a.css({
								color: $f.attr('color')
							});
						});
						// pb.view.$content.find('font').each(function() {
						// 	var inner = this.innerHTML,
						// 	$span = $('<span></span>').html(inner)
						// 	.css({
						// 		color: hex
						// 	});
						// 	$(this).replaceWith($span);
						// });
					} else {
						pb.view.$content.css({
							color: hex
						});
						pb.view.$content.find('a').each(function() {
							var aTag = $(this);
							style = aTag.attr('style');
	                        if(!!style) {
	                            if(!style.match('color')) {
	                                aTag.css({
	                                    'color' : hex
	                                });
	                            }
	                        } else {
	                            aTag.css({
	                                'color' : hex
	                            });
	                        }
						});
						pb.view.$content.find('font').each(function() {
							var $font = $(this);
							$font.replaceWith($font.html());
						});
						pb.view.$content.find('span').each(function() {
							var $span = $(this);
							$span.css({
								color: ''
							});
							if(!$span.attr('style')) {
								$span.replaceWith($span.html());
							}
						});
					}
					wigEvents.trigger('stylechange', 'Text', {
						color : hex
					});
				}
			});
			dbEventer();
		}
	});

	return ColorBar;
})