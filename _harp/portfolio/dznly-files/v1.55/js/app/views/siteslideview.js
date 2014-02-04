define([
	'jquery',
	'app/views/slideview',
    'app/wigevents',
    'app/loadtemplate'
	],
function($, SlideView, wigEvents, loadTemplate){
    var proto = SlideView.prototype
	var SiteSlideView = SlideView.extend({
        initialize: function() {
            proto.initialize.call(this);
            var sv = this;
            this.slideChange = function() {
                sv.stopListening(sv.model, 'change', sv.slideChange);
                sv.stopListening(sv.model.bc, 'change add remove', sv.slideChange);
                sv.model.set('has_content', true);
            };
        },
        render: function() {
            proto.render.call(this);
            this.$slideUp.remove();
            this.$slideDown.remove();
            this.$('.add-slide-above,.add-slide-below,.copy-slide,.save-template').remove();
            this.$('.divider.add,.divider.move').remove();
            this.$name.text(this.model.get('slide_type').toUpperCase());
            this.$('.controls.left').css({
                left: '-120px'
            });
            this.$modal = $('#hf-modal').modal({
                show: false
            });
            return this;
        },
        deleteSlide: function() {
            var sv = this;
            this.$modal.modal('show');
            this.$modal.find('.slide-type').text(this.model.get('slide_type'));

            var deleteFromSite = function() {
                sv.model.set('has_content', false);
                sv.model.save();
                sv.model.collection.remove(sv.model);
                sv.$modal.modal('hide');
            };

            var deleteFromPage = function() {
                sv.model.collection.remove(sv.model);
                sv.$modal.modal('hide');
            };

            var endDelete = function() {
                sv.$modal.off('hide', endDelete);
                sv.$modal.find('.del-site').off('click', deleteFromSite);
                sv.$modal.find('.del-page').off('click', deleteFromPage);

            };

            this.$modal.on('hide', endDelete);
            this.$modal.find('.del-site').on('click', deleteFromSite);
            this.$modal.find('.del-page').on('click', deleteFromPage);
        },
        activate: function() {
            var sv = this;
            this.old_json = {};
            if(!this.model.get('has_content')) {
                this.old_json = this.model.toJSON();
                this.model.bc.set([]);
                this.listenToOnce(this.model, 'change', sv.slideChange);
                this.listenToOnce(this.model.bc, 'change add remove', sv.slideChange);
            }
            proto.activate.call(this);
        },
        deactivate: function() {
            var sv = this;
            sv.stopListening(sv.model, 'change', sv.slideChange);
            sv.stopListening(sv.model.bc, 'change add remove', sv.slideChange);
            if(!this.model.get('has_content') && this.old_json) {
                sv.model.set(this.old_json);
                sv.model.trigger('childupdate');
            }
            proto.deactivate.apply(this, arguments);
        }
	});

	return SiteSlideView;
}
);