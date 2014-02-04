
define([
    'backbone', 
    'app/models/stack',
    'app/views/brickpreview',
    'app/views/appeditview',
    'app/models/placedbrick',
    'app/wigevents'
    ], 
    function(Backbone, Stack, BrickPreview, appEditView, PlacedBrick, wigEvents) {
    var BrickThumb = Backbone.View.extend({
        tagName: 'button',
        className: 'brick-thumb btn btn-single',
        events: {
            'mousedown' : 'startDrag'
        },
        initialize: function() {
            this.brickPreview = new BrickPreview({model: this.model});
            this.brickPreview.render().$el.css({
                'pointer-events' : 'none'
            })
            .hide().appendTo('body');
        },
        render: function() {
            this.$el.append(this.model.get('thumb_html'));
            return this;
        },
        startDrag: function(evt) {
            var thumb = this,
            moved = false;
            evt.preventDefault();
            wigEvents.trigger('pagedragstart');
            this.destinationSV = false;
            this.listenTo(wigEvents, 'pagedragenter', function(sv) {
                this.destinationSV = sv;
                this.brickPreview.$el.removeClass('not-droppable');
                this.brickPreview.$el.addClass('droppable');
            });
            this.listenTo(wigEvents, 'pagedragleave', function(sv) {
                this.brickPreview.$el.removeClass('droppable');
                this.brickPreview.$el.addClass('not-droppable');
            });
            this.brickPreview.startDrag(evt);
            function moveHandler(evt) {
                moved = true;
                thumb.brickPreview.moveTo(evt);
            }
            function upHandler(evt) {
                $(window).off('mousemove', moveHandler)
                .off('mouseup', upHandler);
                wigEvents.trigger('pagedragend');
                if(!moved) {
                    var pb = new PlacedBrick(thumb.brickPreview.model.attributes);
                    var pos = _.pick(thumb.brickPreview.$el.getBox(), 'width', 'height');
                    _.extend(pos, {
                        top: 0,
                        left: 100
                    });
                    pb.set('position', pos);
                    pb.firstPlacement = true;
                    wigEvents.trigger('placebrick', [pb], 40, true);
                    thumb.brickPreview.$el.hide();
                    wigEvents.trigger('changepoint', 'Add ' + pb.get('name'));
                } else if (thumb.destinationSV) {
                    // thumb.brickPreview.endDrag(evt);
                    var pb = new PlacedBrick(thumb.brickPreview.model.attributes);
                    var pos = thumb.brickPreview.$el.getBox();
                    pb.set('position', {
                        top: pos.top,
                        left: pos.left,
                        right: pos.right,
                        bottom: pos.bottom,
                        width: pos.width,
                        height: pos.height
                    });
                    pb.firstPlacement = true;
                    thumb.destinationSV.brickDrop([pb]);
                    thumb.brickPreview.$el.hide();
                    wigEvents.trigger('changepoint', 'Add ' + pb.get('name'));
                } else {
                    thumb.brickPreview.$el.hide();
                }
            }
            $(window).mousemove(moveHandler)
            .mouseup(upHandler);
        }
    });

    return BrickThumb;
});