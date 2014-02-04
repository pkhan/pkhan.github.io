define([
    'underscore',
    'backbone',
    'jquery',
    'app/wigevents',
    'app/appview',
    'snaps'
    ],
function(_, Backbone, $, wigEvents, appView) {
	var GroupEdit = Backbone.View.extend({
		tagName: 'div',
		className: 'all-of-the-bricks highlighted dznly-remove',
		events: {
            'mousedown .handle' : 'startResize'
        },
        initialize: function() {
            appView = require('app/appview');
            this.bricks = [];
        },
        render: function(){
            var groupBox = '<div class="dznly-remove" style="position: static; display: block;"><div class="handle N"></div><div class="handle NW"></div><div class="handle NE"></div><div class="handle S"></div><div class="handle SE"></div><div class="handle SW"></div><div class="handle E"></div><div class="handle W"></div>';
            this.$el.html(groupBox);
            this.on('groupbox:update', function() {
                if(this.bricks.length > 0) {
                    this.updateBox(this.bricks);
                }
            });
            return this;
        },
        updateBox: function(active){
            this.bricks = active;
            var bottom  = -99999,
                right = -99999,
                top    = 99999,
                left   = 99999;
            _.each(active, function(pb){
                var m = pb.view.$el;
                top = (m.top() < top) ? m.top() : top;
                bottom = (m.bottom() > bottom) ? m.bottom() : bottom;
                right = (m.right() > right) ? m.right() : right;
                left = (m.left() < left) ? m.left() : left;
            });

            var height = bottom - top;
            var width = right - left;

            this.$el.css({
                height: height,
                width: width,
                top: top,
                left: left
            });
            this.top = top;
            this.left = left;
        },
        startDrag: function(evt){
            _.each(this.bricks, function(brick) {
                brick.updateBox();
            });
            this.updateBox(this.bricks);
            this.posBricks = _.map(this.bricks, function(pb) {
                return {
                    pb: pb,
                    pos: pb.get('position')
                };
            });
            this.$el.wigSnap({
                mode: 'start',
                event: evt,
                grid: appView.grid,
                slide: this.slide,
                sel: '.brick-full'
            });
        },
        moveBy: function(pos){
            this.$el.css({
                top: this.top + pos.y,
                left: this.left + pos.x
            });

            this.$el.wigSnap({
                mode: 'snap',
                event: pos.evt
            });

            var snapChangeX = this.$el.left() - this.left;
            var snapChangeY = this.$el.top() - this.top;

            _.each(this.posBricks, function(posBrick){
                var b = posBrick.pb;
                var p = posBrick.pos;
                b.view.$el.css({
                    left: p.left + snapChangeX,
                    top: p.top + snapChangeY
                });
            });
        },
        moveGroupTo: function(pos) {
            this.updateBox(this.bricks);
            this.$el.css({
                top: pos.y,
                left: pos.x
            });
            var yDiff = this.$el.top() - this.top;
            var xDiff = this.$el.left() - this.left;

            _.each(this.bricks, function(b){
                b.view.$el.css({
                    left: b.get("position").left + xDiff,
                    top: b.get("position").top + yDiff
                });
                b.updateBox()
            });
            this.updateBox(this.bricks);
        },
        endDrag: function(evt){
            this.$el.wigSnap({
                mode: 'stop',
                event: evt,
            });
            this.updateBox(this.bricks);
        },
        startResize: function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            var el = this;
            var aspectFixed = this.bricks.length === 1 && this.bricks[0].get('category') === 'Image';
            var groupBox = this.$el;
            var bricks = this.bricks;
            _.each(bricks, function(b){
                b.updateBox();

                // updates background size and position in brick model
                // should be moved to update box
                if(b.view.$content.css('background-size') === "auto"){
                    b.view.$content.css('background-size', b.view.$content.width()+'px ' + b.view.$content.height() + 'px');
                };

                // NATE here for backwards compatibility for older version of image resizing
                if(b.view.$content.css('background-size') != "cover"){
                    b.set('bgXPos', parseInt(b.view.$content.css('background-position').split(" ")[0], 10));
                    b.set('bgYPos', parseInt(b.view.$content.css('background-position').split(" ")[1], 10));
                    b.set('bgW', parseInt(_.first(b.view.$content.css('background-size').split(" ")), 10));
                    b.set('bgH', parseInt(_.last(b.view.$content.css('background-size').split(" ")), 10));
                }
            });
            var posBricks = _.map(bricks, function(pb) {
                return {
                    pb: pb,
                    pos: _.clone(pb.get('position'))
                };
            });

            var start_pos = {
                x : evt.pageX,
                y : evt.pageY,
                boxX : this.$el.position().left,
                boxY : this.$el.position().top,
                boxW : this.$el.width(),
                boxH : this.$el.height(),
            },
            $handle = $(evt.target);

            groupBox.wigResizeSnap({
                mode: 'start',
                slide: appView.activeSlide.$slideInt,
                grid: appView.grid,
                sel: '.brick-full',
                aspectFixed: aspectFixed,
                handle: $handle,
                event: evt
            });

            // NATE here for backwards compatibility for older version of image resizing
            var resizeBg = function(b, boxW, boxH, newBoxW, newBoxH){
                el = b.view.$content;

                var xPerc = (newBoxW/boxW);
                var yPerc = (newBoxH/boxH);

                el.css("background-size", parseInt(xPerc * b.get('bgW')) + "px "+ parseInt(yPerc * b.get('bgH'))+"px");
                el.css("background-position", parseInt(b.get('bgXPos')*xPerc)+"px "+parseInt(b.get('bgYPos')*yPerc)+"px");
            }

            var resizeBox = function(evt){
                var xDiff = evt.pageX - start_pos.x,
                    yDiff = evt.pageY - start_pos.y,
                    w = start_pos.boxW,
                    h = start_pos.boxH;

                evt.preventDefault();
                evt.stopPropagation();

                if($handle.hasClass('SW') || $handle.hasClass('S') || $handle.hasClass('SE')) {
                    h = start_pos.boxH + yDiff;
                    groupBox.css({height : h, width: w});
                } 
                
                //east
                if($handle.hasClass('NE') || $handle.hasClass('E') || $handle.hasClass('SE')) {
                    w = start_pos.boxW + xDiff;
                    groupBox.css({width : w, height : h});
                } 
                
                //north
                if($handle.hasClass('N') || $handle.hasClass('NE') || $handle.hasClass('NW')) {
                    var t = start_pos.boxY + yDiff;
                    h = start_pos.boxH - yDiff;
                    groupBox.css({top : t, height : h, width : w});
                }
                
                //west
                if($handle.hasClass('W') || $handle.hasClass('SW') || $handle.hasClass('NW')) {
                    var l = start_pos.boxX + xDiff;
                    w = start_pos.boxW - xDiff;
                    groupBox.css({left : l, width : w, height : h});
                }

                groupBox.wigResizeSnap({
                    mode: 'snap',
                    event: evt
                });

                var centerHeightChange = (groupBox.height()/2.0)/(start_pos.boxH/2.0);
                var centerWidthChange  = (groupBox.width()/2.0)/(start_pos.boxW/2.0);

                _.each(posBricks, function(posBrick){
                    var b = posBrick.pb;
                    var p = posBrick.pos;
                    var boxW = p.width;
                    var boxH = p.height;

                    b.view.$el.css("top", Math.round((p.top-start_pos.boxY)*centerHeightChange)+groupBox.top());
                    b.view.$el.css("height", Math.round(p.height*centerHeightChange));
                    b.view.$content.css("height", Math.round(p.height*centerHeightChange));

                    b.view.$el.css("left", Math.round((p.left-start_pos.boxX)*centerWidthChange)+groupBox.left());
                    b.view.$el.css("width", Math.round(p.width*centerWidthChange));
                    b.view.$content.css("width", Math.round(p.width*centerWidthChange));

                    var newBoxW = b.view.$el.width();
                    var newBoxH = b.view.$el.height();

                    // NATE here for backwards compatibility for older version of image resizing
                    if(b.view.$content.css('background-size') != "cover"){
                        resizeBg(b, boxW, boxH, newBoxW, newBoxH);
                    }
                });
            }

            moveHandler = function(evt, other) {
                resizeBox(evt);
                // // not yet moved over from resizecontrols
                // if(scaling) {
                //     brick.$content.css({
                //         width: brick.$el.width(),
                //         height: brick.$el.height()
                //     }) ;
                // }
            }

            function upHandler(evt) {
                $(window).off('mousemove', moveHandler)
                .off('mouseup', upHandler);
                groupBox.wigResizeSnap({
                    mode: 'stop',
                    event: evt
                });
                _.each(bricks, function(b){
                    b.updateBox();
                });
                wigEvents.trigger('activechange', bricks);
                wigEvents.trigger('changepoint', 'Resize');
            }

            $(window).mousemove(moveHandler)
            .mouseup(upHandler);

        }
    });

    return GroupEdit;
}
);
