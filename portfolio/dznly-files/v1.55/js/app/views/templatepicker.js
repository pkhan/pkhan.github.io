//template picking view
define([
	'underscore',
	'backbone',
	'jquery',
	'app/collections/slidecollection',
	'app/models/template',
	'app/loadtemplate'
	],
function(_, Backbone, $, SlideCollection, Template, loadTemplate) {
	var PickerSlide = Backbone.View.extend({
		tagName: 'div',
		className: 'picker-slide',
		events: {
			'click' : function() {
				this.model.trigger('picked', this.model);
			}
		},
		template: function(slide_html){
			return '<div class="slide-pick-wrap"><div class="mini-slide-int">' + slide_html + '</div></div>'
		},
		render: function(liveRender) {
			if(liveRender) {
				var $miniSlide = $(this.template(this.model.get('slide_html')));
				var $miniInt = $miniSlide.find('.mini-slide-int');
				$miniInt.attr('style', this.model.get('slide_style'));
				$miniInt.css({
					height: this.model.get('height')
				});
				$miniInt.find('.embed-brick').html('');
				this.$el.addClass('live');
				this.$el.html($miniSlide);
				var height = Math.round(this.model.get('height') * .43);
				height = height > 258 ? 258 : height;
				this.$el.css({
					height: height
				});
			} else {
				var $thumb = $('<img>').attr('src', this.model.get('thumbnail'));
				this.$el.html($thumb);
			}
			return this;
		}
	});

	var TemplateCollection = SlideCollection.extend({
		model: Template,
		url: '/api/v1/templates/'
	});

	var TemplatePicker = Backbone.View.extend({
		tagName: 'div',
		className: 'template-picker',
		events: {
			'click #templates-btn' : function() {
				this.$templateRow.show();
				this.$yourRow.hide();
			},
			'click #your-slides-btn': function() {
				this.$templateRow.hide();
				this.$yourRow.show();	
			}
		},
		initialize: function() {
			this.sc = new TemplateCollection();
			this.yourSlides = new TemplateCollection();
			var templatePicker = this;
			this.rendered = false;
			this.render();

			this.yourSlides.url = '/api/v1/myslides/';

			this.listenTo(this.sc, 'add', function(slide) {
				var pickView = new PickerSlide({model: slide});
				pickView.render();
				slide.view = pickView;
				templatePicker.addOne(pickView, this.$templateRow);
			});

			this.listenTo(this.sc, 'picked', function(slide) {
				this.trigger('picked', slide);
				this.hide();
			});

			this.listenTo(this.yourSlides, 'add', function(slide) {
				var pickView = new PickerSlide({model: slide});
				pickView.render(true);
				slide.view = pickView;
				templatePicker.addOne(pickView, this.$yourRow);
			});

			this.listenTo(this.yourSlides, 'change', function(slide) {
				slide.view.render(true);
			});

			this.listenTo(this.yourSlides, 'picked', function(slide) {
				this.trigger('picked', slide);
				this.hide();
			});

			this.listenTo(this.yourSlides, 'remove', function(slide) {
				slide.view.remove();
			});

			this.sc.add({
				name: "Blank Slide",
				thumbnail: window.config.STATIC_URL + 'img/blank-tmp.png'
			});

			this.sc.fetch({
				remove: false,
				data: {
					limit: 0
				}
			});

			if(!window.config.DEMO) {
				this.yourSlides.fetch({
					data: {
						limit: 0
					}
				});
			}
		},
		render: function() {
			if(!this.rendered) {
				this.$el.html(loadTemplate('templatepickerjst'));
				this.$pickerInt = this.$('.picker-int');
				this.$caretLeft = this.$('.picker-left');
				this.$caretRight = this.$('.picker-right');
				this.$templateRow = this.$('.picker-row').first();
				this.$yourRow = this.$templateRow.next().hide();
				this.rendered = true;
			}
			return this;
		},
		addOne: function(pickerSlideView, $addTo) {;
			$addTo.append(pickerSlideView.el);
		},
		onOutsideClick: function(evt) {
			if(this.$el.has(evt.target).length === 0) {
				this.hide();
			}
		},
		bindOutsideClick: function() {
			var templatePicker = this;
			function onOutsideClick (evt) {
				if(templatePicker.$el.has(evt.target).length === 0) {
					templatePicker.hide();
				}
			}
			this.onOutsideClick = onOutsideClick;
			$(window).on('click', onOutsideClick);
		},
		show: function() {
			this.$el.show();
			this.delegateEvents(this.events);
			_.each(this.pickViews, function(pv) {
				pv.delegateEvents(pv.events);
			});
			this.bindOutsideClick();
			this.sc.fetch({
				remove: false,
				data: {
					limit: 0
				}
			});
			if(!window.config.DEMO) {
				this.yourSlides.fetch({
					data: {
						limit: 0
					}
				});
			}
		},
		hide: function() {
			this.$el.hide();
			this.undelegateEvents();
			_.each(this.pickViews, function(pv) {
				pv.undelegateEvents();
			});
			this.off();
			$(window).off('click', this.onOutsideClick);
		}

	});

	return TemplatePicker;
}
);