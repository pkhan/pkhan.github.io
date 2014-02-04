define([
    'underscore',
    'backbone',
    'jquery',
    'app/loadtemplate',
    'jqbox'
    ],
function(_, Backbone, $, loadTemplate) {

    var SpacerData = Backbone.Model.extend({
        defaults: {
            top: 0,
            height: 0,
            last: false
        },
        idAttribute: 'top'
    });

    var Spacer = Backbone.View.extend({
        tagName: 'div',
        className: 'negative-spacer',
        events: {
            'mousedown .resizer': 'startResize',
            'mouseenter': 'displayAcross',
            'mouseleave': 'stopAcross'
        },
        initialize: function() {
            this.resizing = false;
            this.active = false;
        },
        render: function() {
            var spacer = this;
            this.$el.html(loadTemplate('negspacer'));
            this.$resizer = this.$('.resizer');
            this.$info = this.$('.info');

            var updatePos = function() {
                spacer.$el.css({
                    top: spacer.model.get('top'),
                    height: spacer.model.get('height')
                });
            };

            this.listenTo(this.model, 'change', updatePos);
            updatePos();

            this.listenTo(this.model.collection, 'spacer:resize', function(spacer, yDiff) {
                var top = this.model.get('top');
                if(top > spacer.get('top')) {
                    this.model.set('top', top + yDiff);
                }
            });

            return this;
        },
        place: function(box) {
            this.$el.css({
                top: box.top,
                height: box.height
            });
        },
        activate: function() {
            this.active = true;
            this.$el.addClass('active');
            this.displayAcross();
        },
        deactivate: function() {
            this.active = false;
            this.$el.removeClass('active');
            this.stopAcross();
        },
        displayAcross: function() {
            this.$el.css({
                width: $(document).width(),
            });
        },
        stopAcross: function() {
            if(!this.resizing) {
                this.$el.css({
                    width: ''
                });
            }
        },
        activeToggle: function() {
            if(this.active) {
                this.deactivate();
            } else {
                this.activate();
            }
        },
        startResize: function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            var spacerView = this;
            var startPos = {
                y: evt.pageY,
                height: this.model.get('height')
            };

            this.displayAcross();
            this.resizing = true;

            this.$el.wigResizeSnap({
                mode: 'start',
                slide: this.$el.parent(),
                sel: '.negative-spacer',
                grid: false,
                aspectFixed: false,
                handle: $('<div/>').addClass('S'),
                event: evt
            });
            this.model.trigger('spacer:resizestart', this.model);

            var moveHandler = function(evt) {
                evt.stopPropagation();
                evt.preventDefault();
                var yDiff = evt.pageY - startPos.y;
                var oldHeight = startPos.height;
                var newHeight = oldHeight + yDiff;
                newHeight = newHeight > 2 ? newHeight : 2;
                spacerView.$el.css({
                    height: newHeight
                });
                var oldWidth = spacerView.$el.css('width');
                spacerView.$el.wigResizeSnap({
                    mode: 'snap',
                    event: evt,
                    matchClass: 'snap-match',
                    skipLines: true,
                    exclude: 'x',
                    sizeOnly: true,
                    ignoreSlide: true
                });
                spacerView.$el.css('width', oldWidth);
                var snappedHeight = spacerView.$el.height();
                var newYDiff = snappedHeight - spacerView.model.get('height');
                spacerView.model.set('height', snappedHeight);
                spacerView.model.trigger('spacer:resize', spacerView.model, newYDiff);
            };

            var upHandler = function(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                spacerView.$el.wigResizeSnap({
                    mode: 'stop',
                    event: evt,
                    matchClass: 'snap-match'
                });
                spacerView.model.trigger('spacer:resizeend');
                $(window).off('mousemove', moveHandler)
                .off('mouseup', upHandler);
                spacerView.resizing = false;
                spacerView.stopAcross();
            };

            $(window).on('mousemove', moveHandler)
            .on('mouseup', upHandler);            
        }
    });

    var SpacerCollection = Backbone.Collection.extend({
        model: SpacerData,
        comparator: 'top'

    });
    

    var NegSpace = Backbone.View.extend({
        tagName: 'div',
        className: 'negative-wrapper',
        initialize: function() {
            this.spacers = new SpacerCollection();
            this.shown = false;
        },
        render: function() {
            this.hide();
            this.listenTo(this.spacers, 'add', function(spacer) {
                spacer.view = new Spacer({model:spacer});
                spacer.view.render();
                this.$el.append(spacer.view.el);
            });
            this.listenTo(this.spacers, 'spacer:resizestart', function() {
                this.$el.css('pointer-events', 'auto');
            });
            this.listenTo(this.spacers, 'spacer:resizeend', function() {
                this.$el.css('pointer-events', '');
            });
            this.listenTo(this.spacers, 'remove', function(spacer){
                spacer.view.remove();
            });
            return this;
        },
        setPos: function(width) {
            this.$el.css({
                // top: top,
                width: width
            });
        },
        getSpaces: function(bc, slide) {
            var posBoxes = [];
            var negBoxes = [];
            bc.forEach(function(pb) {
                var category = pb.get('category');
                var pos;
                pos = pb.get('position');
                var box = new Box(pos.top, 0, pos.height + 1, pos.width);
                posBoxes.push(box);
            });
            posBoxes = _.sortBy(posBoxes, 'top');
            var groupBox = new Box(0,0,0,10);
            _.each(posBoxes, function(posBox) {
                if(posBox.overlap(groupBox)) {
                    groupBox = groupBox.surround(posBox);
                } else {
                    negBoxes.push( new Box(
                        groupBox.bottom,
                        0,
                        posBox.top - groupBox.bottom,
                        0
                    ));
                    groupBox = posBox;
                }
            });
            if(groupBox.bottom < slide.get('height')) {
                negBoxes.push(new Box(
                    groupBox.bottom, 
                    -1,
                    slide.get('height') - groupBox.bottom,
                    0
                ));
            }

            return negBoxes;
        },
        update: function(bc, slide) {
            var negBoxes = _.map(this.getSpaces(bc, slide), function(box) {
                return _.pick(box, 'top', 'height');
            });
            this.spacers.set(negBoxes);
        },
        show: function() {
            this.$el.show();
            this.shown = true;
        },
        hide: function() {
            this.$el.hide();
            this.shown = false;
        }
    });

    return NegSpace;
}
);