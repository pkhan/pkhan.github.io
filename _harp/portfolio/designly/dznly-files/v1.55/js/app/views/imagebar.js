define([
    'underscore',
    'jquery',
    'backbone',
    'app/views/barview',
    'app/wigevents',
    'jqbox'
    ],
function(_, $, Backbone, BarView, wigEvents) {

    var ImageBar = BarView.extend({
        el: '.image-controls',
        cropoverlay_html: '<div class="dznly-remove crop-overlay"></div>',
        cropbox_html: '<div class="dznly-remove crop-box"><div style="position: static; display: block;"><div class="handle N"></div><div class="handle NW"></div><div class="handle NE"></div><div class="handle S"></div><div class="handle SE"></div><div class="handle SW"></div><div class="handle E"></div><div class="handle W"></div></div></div>',
        events: {
            'click #img-replace': 'replaceImage',
            'click #img-edit': 'editImage',
            'click #img-fit' : 'imgFit'
        },
        barInit: function() {
            var imgBar = this;
            this.types = ['Image'];

            this.listenTo(wigEvents, 'appstart', function(appView) {
                imgBar.appView = appView;
            });

        },
        render: function() {
            this.$cropBox = $(this.cropbox_html).css({
                'border-color': 'blue'
            });
            this.$cropBox.find('.handle').css({
                'background-color' : 'blue'
            });
            this.$cropOverlay = $(this.cropoverlay_html);
            return this;
        },
        setActive: function(active) {
            if(active.length > 1) {
                this.hide();
            }
            this.active = active;
        },
        editImage: function() {
            wigEvents.trigger('image:edit', this.active[0]);
        },
        replaceImage: function() {
            this.active[0].view.trigger('pickimage', this.active[0].get('position'));
        },
        imgFit: function() {
            var slideBox = false;
            var anyChange = false;
            _.each(this.active, function(pb) {
                var pos = pb.get('position');
                var pbBox = new Box(pos.top, pos.left, pos.height, pos.width);
                var change = false;
                if(!slideBox) {
                    slideBox = pb.view.$el.parent().getBox();
                }
                if(pbBox.width > slideBox.width) {
                    pbBox.resizeAR(0, slideBox.width - pos.width);
                    change = true;
                }
                if(pbBox.height > slideBox.height) {
                    pbBox.resizeAR(slideBox.height - pos.height, 0);
                    change = true;
                }
                if(change) {
                    pb.view.$el.css({
                        width: pbBox.width,
                        height: pbBox.height
                    });
                    pb.view.$content.css({
                        width: pbBox.width,
                        height: pbBox.height
                    });
                    pb.updateBox();
                    anyChange = true;
                }

            });
            if(anyChange) {
                _.each(this.active, function(pb) {
                    pb.view.activate(true);
                });
            }
            wigEvents.trigger('changepoint', 'Fit Image');
        }

    });

    return ImageBar;
});