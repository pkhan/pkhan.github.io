define([
	'jquery',
	'underscore',
	'backbone',
	'app/loadtemplate',
	'app/wigevents',
	'app/models/placedbrick'
	],
function($, _, Backbone, loadTemplate, wigEvents, PlacedBrick) {

	var Component = Backbone.Model.extend({
		defaults: {
			label: 'Component',
			screenshot: 'thumb.png',
			description: 'Long description',
			name: 'Text',
			html: '<div></div>',
			category: 'Text',
			thumb_html : '<i class="icon-plus-sign"></i><h5>Add</h5>'
		},
		getBrickAttr: function() {
			return _.pick(this.attributes, 'name', 'html', 'category', 'thumb_html');
		}
	});

	var CompView = Backbone.View.extend({
		tagName: 'li',
		className: 'component',
		events: {
			'click' : 'picked'
		},
		initialize: function() {
			this.$imgCache = false;
		},
		render: function() {
			this.$el.html('<a href="#">' + this.model.get('label') + '</a>');
			return this;
		},
		picked: function(evt) {
			evt.preventDefault();
			evt.stopPropagation();
			this.preload();
			this.model.trigger('picked', this.model);
		},
		preload: function() {
			if(!this.$imgCache) {
				this.$imgCache = $('<img/>').attr('src', this.model.get('screenshot'));
			}
		}
	});

	var CompCollection = Backbone.Collection.extend({
		model: Component
	});

	var Category = Backbone.Model.extend({
		constructor: function() {
			this.components = new CompCollection();
			this.listenTo(this.components, 'picked', function(component) {
				this.trigger('picked', component);
			});
			this.subCategories = new CatCollection();
			this.listenTo(this.subCategories, 'picked', function(component) {
				this.trigger('picked', component);
			});
			Backbone.Model.apply(this, arguments);
		},
		initialize: function() {
			this.components.set(this.get('components'));
			this.subCategories.set(this.get('subcategories'));
		},
		defaults: function() {
			return {
				name: 'Category',
				subcategories: [],
				components: []
			};
		},
		urlRoot: '',
		parse: function(raw) {
			this.components.set(raw.components);
			this.subCategories.set(raw.subcategories);
			return raw;
		}
	});

	var CatCollection = Backbone.Collection.extend({
		model: Category,
		url: 'http://lib-designly.herokuapp.com/categories.json',
		fetch: function(opts) {
			opts = opts || {};
			var bakedOpts = {
				type: 'GET',
				dataType: 'jsonp',
				jsonp: 'jsonpCallback'
			};
			_.extend(bakedOpts, opts);
			return Backbone.Collection.prototype.fetch.call(this, bakedOpts);
		},
		parse: function(raw) {
			return raw.categories;
		}
	});

	var CatView = Backbone.View.extend({
		tagName: 'li',
		events: {
			'click': 'toggleCategory'
		},
		initialize: function() {
			this.listenTo(this.model.components, '');
			this.childrenShown = false;
		},
		render: function() {
			var cv = this;
			this.$el.html(loadTemplate('catview-jst', this.model.toJSON()));
			this.$list = this.$('.clib-list');
			this.model.subCategories.forEach(function(cat) {
				cat.view = new CatView({model: cat});
				cat.view.render();
				cv.$list.append(cat.view.el);
			});
			this.model.components.forEach(function(comp) {
				comp.view = new CompView({model: comp});
				comp.view.render();
				cv.$list.append(comp.view.el);
			});
			this.$plusMinus = this.$('>a>.clib-plus-minus');
			this.hideChildren();
			return this;
		},
		toggleCategory: function(evt) {
			evt.preventDefault();
			evt.stopPropagation();
			if(this.childrenShown) {
				this.hideList();
			} else {
				this.showList();
			}
			// this.$list.slideToggle();
		},
		hideChildren: function() {
			this.model.subCategories.forEach(function(cat) {
				cat.view.hideChildren();
			});
			this.$list.hide();
			this.$plusMinus.removeClass('icon-minus').addClass('icon-plus');
			this.childrenShown = false;
		},
		showChildren: function() {
			this.model.subCategories.forEach(function(cat) {
				cat.view.showChildren();
			});
			this.$list.show();
			this.$plusMinus.removeClass('icon-plus').addClass('icon-minus');
			this.childrenShown = true;
		},
		initChildren: function() {
			this.$list.show();
			this.childrenShown = true;
			this.$plusMinus.removeClass('icon-plus').addClass('icon-minus');
			this.model.subCategories.forEach(function(cat) {
				if(cat.components.length === 0) {
					cat.view.initChildren();
				}
			});
		},
		showList: function() {
			if(!this.childrenShown) {
				this.$list.slideDown('fast');
				this.childrenShown = true;
				this.$plusMinus.removeClass('icon-plus').addClass('icon-minus');
				this.model.components.forEach(function(comp) {
					comp.view.preload();
				});
			}
		},
		hideList: function() {
			if(this.childrenShown) {
				this.$list.slideUp('fast');
				this.childrenShown = false;
				this.$plusMinus.removeClass('icon-minus').addClass('icon-plus');
			}
		}
	});

	var ComponentLib = Backbone.View.extend({
		el: '.clib-side-menu',
		events: {
			'click .clib-add' : 'add'
		},
		initialize: function() {
			this.categories = new CatCollection();
			this.activeComp = false;
			this.listenTo(this.categories, 'picked', function(component) {
				this.$addBtn.removeClass('disabled');
				this.$imgPreview.replaceWith(component.view.$imgCache);
				this.$imgPreview = component.view.$imgCache;
				this.activeComp = component;
			});
			this.listenToOnce(this.categories, 'sync', function(cat) {
				this.renderAll();
			});
		},
		render: function() {
			this.$list = this.$('.clib-list');
			this.$imgPreview = this.$('.clib-preview img');
			this.$addBtn = this.$('.clib-add').addClass('disabled');

			this.categories.fetch();
			return this;
		},
		renderAll: function() {
			var frag = document.createDocumentFragment();
			this.categories.forEach(function(cat) {
				cat.view = new CatView({model: cat});
				cat.view.render();
				cat.view.initChildren();
				frag.appendChild(cat.view.el);
			});
			this.$list.append(frag);
		},
		add: function() {
			if(this.activeComp) {
				var pb = new PlacedBrick(this.activeComp.getBrickAttr());
				pb.firstPlacement = false;
				wigEvents.trigger('placebrick', [pb], 40, true);
				pb.view.$el.css({
					width: pb.view.$content.width(),
					height: pb.view.$content.height()
				});
				pb.updateBox();
				pb.view.deactivate();
				pb.view.activate(false);
				wigEvents.trigger('changepoint', 'Added ' + pb.get('name'));
				wigEvents.trigger('sidemenu:hide');
			}
		}
	});

	return ComponentLib;
}
);