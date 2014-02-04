define([
	'underscore',
	'backbone',
	'app/views/barview',
	'app/collections/stackcollection',
	'app/wigevents'
	],
function(_, Backbone, BarView, StackCollection, wigEvents) {

	var OtherPageView = Backbone.View.extend({
		tagName: 'li',
		template: function(name) {
			return '<a href="#">' + name + '</a>';
		},
		events: {
			'click' : function(evt) {
				evt.preventDefault();
				this.model.trigger('picked', this.model);
			}
		},
		render: function() {
			this.$el.html(this.template(this.model.get('name')));
			return this;
		}
	});

	var SectionView = Backbone.View.extend({
		tagName: 'li',
		template: function(number) {
			return '<a href="#">#' + number + '</a>';
		},
		events: {
			'click': function(evt){
				evt.preventDefault();
				this.model.trigger('picked', this.model);
			}
		},
		render: function() {
			this.$el.html(this.template(this.model.collection.indexOf(this.model) + 1));
			return this;
		}
	});

	var LinkBar = BarView.extend({
		el: '.link-controls',
		events: {
			'mouseup .add-link': function(evt) {
				// this.$('.link-adder').dropdown('toggle');
				// this.$addLink.parent().toggleClass('open');
				var wrap, 
				active = this.active,
				lb = this,
				links = [],
				link = '',
				stack;

				this.$stackList.find('li a').removeClass('btn-primary');

				lb.$('.current').text('Sections in This Page')
				.removeClass('btn-primary');

				if(active.length === 1 && active[0].view.editing) {
					links = [];
				} else {
					links = _.map(active, function(pb) {
						return pb.view.$content.parent().attr('href') || '';
					});
				}
				links = _.uniq(links);
				if(links.length === 1) {
					link = links[0];
				}

				if(link.match(/^\$/)) {
					stack = this.stacks.findWhere({
						id: Number(link.replace('$', ''))
					});
					stack.view.$el.find('a').addClass('btn-primary');
					this.$linkBox.val('');
				} else if (link.match(/^#/)) {
					slide = this.slides.findWhere({
						id: Number(link.replace('#section-', ''))
					});
					lb.$('.current').text('#' + (slide.collection.indexOf(slide) + 1))
					.addClass('btn-primary');

				} else {
					this.$linkBox.val(link);
				}
				var $linkBox = this.$linkBox;
				_.delay(function() {
					$linkBox.blur().focus()
				}, 1);
			},
			'click .link-adder': function(evt) {
				evt.stopPropagation();
			},
			// 'click .set-link': 'customLinkSet',
			'click .remove-link' : 'removeLink',
			'submit #link-form' : function(evt) {
				evt.preventDefault();
				this.customLinkSet();
			},
			'mouseenter': function(evt) {
				if(!$(evt.target).hasClass('tooltip')) {
					wigEvents.trigger('showslidenums');
				}
			},
			'mouseenter .tooltip': function() {
				wigEvents.trigger('hideslidenums');	
			},
			'mouseleave': function() {
				wigEvents.trigger('hideslidenums');	
			}
		},
		barInit: function() {
			var lb = this;
			this.stacks = new StackCollection();

			wigEvents.once('appstart', function(appView) {
				lb.appView = appView;
				if(appView.stack.get('site') && !window.config.DEMO) {
					lb.stacks.fetch({
						data: {
							site: window.site_json.id,
							limit: 0
						}
					});
				}

				lb.slides = appView.stack.sc;
				var frag = document.createDocumentFragment();
				var views = [];
				lb.slides.forEach(function(slide) {
					var sv = new SectionView({model:slide});
					views.push(sv);
					frag.appendChild(sv.render().el);
				});
				lb.$inPageLinks.html(frag);
				lb.listenTo(lb.slides, 'sort', function() {
					_.each(views, function(view){
						view.remove();
					});
					views = [];
					var frag = document.createDocumentFragment();
					lb.slides.forEach(function(slide) {
						var sv = new SectionView({model:slide});
						views.push(sv);
						frag.appendChild(sv.render().el);
					});
					lb.$inPageLinks.html(frag);
				});
				lb.listenTo(lb.slides, 'picked', function(slide) {
					var linkStr = String('#section-' + slide.get('id'));
					lb.setLink(linkStr);
				});
			});

			renderStacksDB = _.debounce(function() {
				lb.renderStacks();
			}, 100);

			this.stacks.on('add', function(stack) {
				stack.view = new OtherPageView({model: stack});
				stack.view.render();
				renderStacksDB();
			});

			this.stacks.on('picked', function(stack) {
				var linkStr = String('$' + stack.get('id'));
				lb.setLink(linkStr)
			});
		},
		render: function() {
			this.$addLink = this.$('.add-link');
			this.$addLink.dropdown();
			this.$removeLink = this.$('.remove-link');
			this.$linkAdder = this.$('.link-adder');
			this.$stackList = this.$('.other-pages');
			this.$linkBox = this.$('.link-box');
			this.$inPageLinks = this.$('.in-page-links');
			return this;
		},
		setActive: function(active) {
			this.active = active;
			// var wrap;
			// if(active.length > 0) {
			// 	wrap = active[0].view.$content.parent();
			// 	if(wrap[0].tagName === 'A') {
			// 		this.$('.link-box').val(wrap.attr('href'));
			// 	} else {
			// 		this.$('.link-box').val('');
			// 	}
			// }
		},
		renderStacks: function() {
			var frag = document.createDocumentFragment(),
			lb = this;
			this.stacks.forEach(function(stack) {
				frag.appendChild(stack.view.el);
			});
			this.$stackList.html(frag);
		},
		customLinkSet: function() {
			var linkStr = this.$('.link-box').val();
			if(!!linkStr.match('@') && !linkStr.match(/^mailto/)) {
				linkStr = 'mailto:' + linkStr;
			} else if(!linkStr.match(/^http/) && !linkStr.match(/^mailto/)) {
				linkStr = 'http://' + linkStr;
			}
			this.setLink(linkStr);
		},
		setLink: function(linkStr){ 
			var wrapper = '<a href="' + linkStr + '"></a>';
			_.each(this.active, function(pb) {
				var $content = pb.view.$content;
				if(pb.view.editing) {
					$content.trigger('command', 'createLink ' + linkStr);
				} else {
					$content.find('a').each(function() {
						var $a = $(this),
						html = $a.html();
						if($a.attr('style')) {
							$a.replaceWith('<span style="' + $a.attr('style') + '">' + html + '</span>');
						} else {
							$a.replaceWith(html);
						}
					});
					if($content.parent()[0].tagName === 'A') {
						$content.unwrap();
						pb.set('wrapper', '');
					}
					if($content[0].tagName === 'A') {
						$content.attr('href', linkStr);
					} else {
						pb.view.$content.wrap(wrapper);
						pb.set('wrapper', wrapper);
					}
					wigEvents.trigger('changepoint', 'Add Link');
				}
			});
			this.$inPageLinks.parent().removeClass('open')
			.css('margin');

			this.$addLink.parent().removeClass('open');
		},
		removeLink: function() {
			_.each(this.active, function(pb) {
				var $content = pb.view.$content;
				if(pb.view.editing) {
					$content.trigger('command', 'unlink');
				} else {
					if($content.parent()[0].tagName === 'A') {
						$content.unwrap();
						pb.set('wrapper', '');
					}
				}
			});
		}
	});

	return LinkBar;
});