
define([
    'underscore',
    'jquery',
    'app/views/modalcontrol',
    'app/wigevents'
    ], 
    function(_, $, ModalControl, wigEvents) {
    var ResizeControl = ModalControl.extend({
        state: 'active',
        html: '<div class="handle"></div>',
        positions: [
            'N',
            'NW',
            'NE',
            'S',
            'SE',
            'SW',
            'E',
            'W'
        ],
        css: {
            position: 'static'
        },
        events: {
            'mousedown .handle' : 'startStretch'
        },
        render: function() {
            // var handles = 8,
            // i = 0;

            // for(i = 0 ; i < handles; i++) {
            //     $(this.html).addClass(this.positions[i])
            //     .appendTo(this.el);
            // }

            // this.$el.css(this.css);
            return this;
        },
        show: function() {
            this.$el.show();
        },
        startStretch: function(evt) {

            //resizing initializing
            this.$el.wigResizeSnap({
                        mode: 'start',
                        slide: appView.activeSlide.$slideInt,
                        sel: '.brick-full',
                        handle: $(evt.target),
                        event: evt
                    });


            var resizeBg = function(el, start_pos, newBrickW, newBrickH){
                var xPerc = (newBrickW/start_pos.brickW);
                var yPerc = (newBrickH/start_pos.brickH);

                el.css("background-size", parseInt(xPerc * start_pos.bgW) + "px "+ parseInt(yPerc * start_pos.bgH)+"px");
                el.css("background-position", parseInt(start_pos.bgXPos*xPerc)+"px "+parseInt(start_pos.bgYPos*yPerc)+"px");
                // console.log(parseInt(xPerc * start_pos.bgW) + "px "+ parseInt(yPerc * start_pos.bgH)+"px");
            }


            var moveHandler,
            brick = this.brick;

            if(brick.$el.css('background-size') === "auto"){
                brick.$el.css('background-size', brick.$el.width()+'px ' + brick.$el.height() + 'px');
            }

            var start_pos = {
                x : evt.pageX,
                y : evt.pageY,
                brickX : brick.$el.position().left,
                brickY : brick.$el.position().top,
                brickW : brick.$el.width(),
                brickH : brick.$el.height(),
                bgXPos : parseInt(brick.$content.css('background-position').split(" ")[0], 10),
                bgYPos : parseInt(brick.$content.css('background-position').split(" ")[1], 10),
                bgW : parseInt(_.first(brick.$content.css('background-size').split(" ")), 10),
                bgH : parseInt(_.last(brick.$content.css('background-size').split(" ")), 10)
            },
            $target = $(evt.target),
            resizeFunc,
            modal = this;

            evt.stopPropagation();
            evt.preventDefault()
            var scaling = brick.model.get('scaling');
            var aspectFixed = brick.model.get('name') === 'Image';


            var resize = function(evt){
                var xDiff = evt.pageX - start_pos.x,
                    yDiff = evt.pageY - start_pos.y,
                    w = start_pos.brickW,
                    h = start_pos.brickH;
                evt.preventDefault();
                evt.stopPropagation();
                
                //south
                if($target.hasClass('SW') || $target.hasClass('S') || $target.hasClass('SE')) {
                    h = start_pos.brickH + yDiff;
                    if(aspectFixed){ w = (h/start_pos.brickH)*start_pos.brickW; }
                    brick.$el.css({height : h, width: w});
                } 
                
                //east
                if($target.hasClass('NE') || $target.hasClass('E') || $target.hasClass('SE')) {
                    w = start_pos.brickW + xDiff;
                    if(aspectFixed){ h = (w/start_pos.brickW)*start_pos.brickH; }
                    brick.$el.css({width : w, height : h});
                } 
                
                //north
                if($target.hasClass('N') || $target.hasClass('NE')) {
                    var t = start_pos.brickY + yDiff;
                    h = start_pos.brickH - yDiff;
                    if(aspectFixed){ w = (h/start_pos.brickH)*start_pos.brickW; }
                    brick.$el.css({top : t, height : h, width : w});
                }
                
                //west
                if($target.hasClass('W') || $target.hasClass('SW')) {
                    var l = start_pos.brickX + xDiff;
                    w = start_pos.brickW - xDiff;
                    if(aspectFixed){ h = (w/start_pos.brickW)*start_pos.brickH; }
                    brick.$el.css({left : l, width : w, height : h});
                }

                //NW
                if($target.hasClass('NW')) {
                    var l = start_pos.brickX + xDiff,
                    w = start_pos.brickW - xDiff,
                    t = start_pos.brickY + yDiff,
                    h = start_pos.brickH - yDiff;

                    if(aspectFixed){ 
                        h = (w/start_pos.brickW)*start_pos.brickH; 
                        t = start_pos.brickY - (h - start_pos.brickH);
                    }
                    brick.$el.css({
                        left : l, 
                        top: t,
                        width : w, 
                        height : h
                    });
                    // if(aspectFixed){ w = (h/start_pos.brickH)*start_pos.brickW; }
                    // brick.$el.css({top : t, height : h, width : w});
                }
                
                resizeBg(brick.$content, start_pos, w, h);
            }

            moveHandler = function(evt) {
                resize(evt);
                if(!aspectFixed) {
                    brick.$el.wigResizeSnap({
                        mode: 'snap',
                        event: evt
                    });
                }

                if(scaling) {
                    // if(brick.model.get('name') === 'Image' && !brick.$el.hasClass('crop')) {
                    //     brick.$content.css({
                    //         'background-size': brick.$el.width() + 'px ' + brick.$el.height() + 'px',
                    //     });
                    // }
                    brick.$content.css({
                        width: brick.$el.width(),
                        height: brick.$el.height()
                    }) ;
                }
            }

            function upHandler(evt) {
                $(window).off('mousemove', moveHandler)
                .off('mouseup', upHandler);
                modal.update();
                brick.$el.wigResizeSnap({
                    mode: 'stop',
                    event: evt
                });
                wigEvents.trigger('changepoint', 'Resize');
            }

            $(window).mousemove(moveHandler)
            .mouseup(upHandler);

        }

    });

    return ResizeControl;
});