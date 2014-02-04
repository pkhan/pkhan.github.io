
define([
    'jquery',
    'app/views/modalcontrol',
    'app/wigevents'
    ], 
    function($, ModalControl, wigEvents) {
    var CropControl = ModalControl.extend({
        state: 'hover',
        html: '<i class="icon-crop"></i>',
        cropoverlay_html: '<div class="crop-overlay"></div>',
        cropbox_html: '<div class="crop-box"><div style="position: static; display: block;"><div class="handle N"></div><div class="handle NW"></div><div class="handle NE"></div><div class="handle S"></div><div class="handle SE"></div><div class="handle SW"></div><div class="handle E"></div><div class="handle W"></div></div></div>',
        css: {
            cursor: 'pointer'
        },
        active: false,
        events: {
            'click' : function(evt) {
                evt.stopPropagation();
                if(this.active) {
                    this.stop();
                } else {
                    this.start();
                }
            }
        },
        modalInit: function() {
            this.targets = ['Image'];
        },
        render: function() {
            this.$el.html(this.html).css({
                'background-color' : 'white',
                'cursor' : 'pointer'
            });
            this.$cropBox = $(this.cropbox_html).css({
                'border-color': 'blue'
            });
            this.$cropBox.find('.handle').css({
                'background-color' : 'blue'
            });
            this.$cropOverlay = $(this.cropoverlay_html);
            return this;
        },
        show: function() {
            if(this.brick.model.get('name') === 'Image') {
                this.$el.css({
                    top: this.brick.$el.height() - this.$el.height(),
                    left: this.brick.$el.width() - this.$el.width()
                })
                .show();
            }
        },
        getBackgroundPosition: function($e) {
            var pos = $e.css('background-position').split(' '), 
            result = {
                x: Number(_.first(pos).replace('px', '')),
                y: Number(_.last(pos).replace('px', ''))
            };
            return result;
        },
        backgroundPositionString: function(posObj) {
            return posObj.x + 'px ' + posObj.y + 'px';
        },
        start: function() {
            this.active = true;
            this.$el.css({
                'background-color' : 'blue'
            });
            var brick = this.brick;
            var $content = brick.$content;
            var cropControl = this;
            var $cropBox = this.$cropBox;
            var moved = false;
            brick.disable();
            _.each(brick.modals, function(modal) {
                modal.$el.hide();
            });
            this.$el.show();
            // var bpX = $content.css('background-position-x') || '0px';
            // var bpY = $content.css('background-position-y') || '0px';
            var contentBPos = this.getBackgroundPosition($content);
            this.$cropBox.css({
                'background-image' : $content.css('background-image'),
                'background-position' : this.backgroundPositionString(contentBPos),
                // 'background-position-y' : $content.css('background-position-y'),
                // 'background-position-x' : $content.css('background-position-x'),
                'background-size' : $content.css('background-size'),
                width: $content.width(),
                height: $content.height(),
                top: (-1 * contentBPos.y) +'px',
                left: (-1 * contentBPos.x) +'px'
            });
            brick.$el.css({
                top: '+=' + contentBPos.y + 'px',
                left: '+=' + contentBPos.x + 'px',
                width: _.first($content.css('background-size').split(' ')),
                height: _.last($content.css('background-size').split(' '))
            });
            $content.css({
                width: _.first($content.css('background-size').split(' ')),
                height: _.last($content.css('background-size').split(' ')),
                'background-position' : '0 0'
            });
            this.$cropOverlay.appendTo($content);
            this.$cropBox.appendTo($content);
            $cropBox.offset();
            // $cropBox.css({
            //     width: '50%',
            //     height: '50%'
            // });

            var startPos = {};

            var moveHandlerMove = function(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                moved = true;
                var yDiff = evt.pageY - startPos.top,
                xDiff = evt.pageX - startPos.left,
                pos = {
                    top: startPos.cropTop,
                    left: startPos.cropLeft
                },
                width = $cropBox.width(),
                height = $cropBox.height(),
                contentHeight = $content.height(),
                contentWidth = $content.width();

                var newPos = {
                    top: pos.top + yDiff,
                    left: pos.left + xDiff
                };

                if(newPos.top < 0) {
                    newPos.top = 0;
                } else if(newPos.top + height > contentHeight) {
                    newPos.top = contentHeight - height;
                }
                if(newPos.left < 0) {
                    newPos.left = 0;
                } else if(newPos.left + width > contentWidth) {
                    newPos.left = contentWidth - width;
                }

                $cropBox.css(newPos);

                $cropBox.css({
                    'background-position' : (-1 * newPos.left) + 'px ' + (-1 * newPos.top) + 'px'
                    // 'background-position-x' : -1 * newPos.left,
                    // 'background-position-y' : -1 * newPos.top
                });
            };

            var upHandlerMove = function(evt) {
                $(window).off('mousemove', moveHandlerMove)
                .off('mouseup', upHandlerMove);
            };

            var downHandlerMove = function(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                moved = false;
                startPos.top = evt.pageY;
                startPos.left = evt.pageX;
                startPos.cropTop = $cropBox.position().top;
                startPos.cropLeft = $cropBox.position().left;
                $(window).on('mousemove', moveHandlerMove)
                .on('mouseup', upHandlerMove);
            };

            $cropBox.on('mousedown', downHandlerMove);

            var handleBox = '';

            var moveHandlerResize = function(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                moved = true;
                var yDiff = evt.pageY - startPos.top,
                xDiff = evt.pageX - startPos.left,
                oldPos = {
                    top: startPos.cropTop,
                    left: startPos.cropLeft,
                    width: startPos.cropWidth,
                    height: startPos.cropHeight
                },
                newPos = _.clone(oldPos),
                contentHeight = $content.height(),
                contentWidth = $content.width();

                if(!!handleBox.match('N')) {
                    newPos.top += yDiff;
                    newPos.height -= yDiff;
                }
                if(!!handleBox.match('E')) {
                    newPos.width += xDiff;
                }
                if(!!handleBox.match('S')) {
                    newPos.height += yDiff;
                }
                if(!!handleBox.match('W')) {
                    newPos.left += xDiff;
                    newPos.width -= xDiff;
                }

                if(newPos.top < 0) {
                    newPos.height += newPos.top;
                    newPos.top = 0;
                } else if(newPos.top + newPos.height > contentHeight) {
                    newPos.height = contentHeight - newPos.top;
                }
                if(newPos.left < 0) {
                    newPos.width += newPos.left;
                    newPos.left = 0;
                } else if(newPos.left + newPos.width > contentWidth) {
                    newPos.width = contentWidth - newPos.left;
                }

                $cropBox.css(newPos).css({
                    'background-position' : (-1 * newPos.left) + 'px ' + (-1 * newPos.top) + 'px'
                    // 'background-position-x' : -1 * newPos.left,
                    // 'background-position-y' : -1 * newPos.top
                });
            };

            var upHandlerResize = function(evt) {
                $(window).off('mousemove', moveHandlerResize)
                .off('mouseup', upHandlerResize);
            };

            var downHandlerResize = function(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                moved = false;
                startPos.top = evt.pageY;
                startPos.left = evt.pageX;
                startPos.cropTop = $cropBox.position().top;
                startPos.cropLeft = $cropBox.position().left;
                startPos.cropHeight = $cropBox.height();
                startPos.cropWidth = $cropBox.width();

                handleBox = $(evt.target).attr('class').replace('hande', '').replace(' ','');

                $(window).on('mousemove', moveHandlerResize)
                .on('mouseup', upHandlerResize);
            };

            var clickHandler = function(evt) {
                if(brick.$el.has(evt.target).length === 0) {
                    cropControl.stop();
                }
            };

            $(window).on('click', clickHandler);

            $cropBox.find('.handle').on('mousedown', downHandlerResize);
            this.stopEvents = function() {
                $(window).off('mousedown', downHandlerResize)
                .off('mousedown', downHandlerMove)
                .off('click', clickHandler);
            }

        },
        stop: function() {
            this.$el.css({
                'background-color': 'white'
            });
            // this.brick.$el.removeClass('crop');
            // brick.$content.css({
            //     cursor: ''
            // });
            // brick.$content.off('mousedown');
            this.stopEvents();

            this.brick.$el.css({
                top: '+=' + this.$cropBox.position().top + 'px',
                left: '+=' + this.$cropBox.position().left + 'px',
                height: this.$cropBox.height(),
                width: this.$cropBox.width()
            });
            this.brick.$content.css({
                height: this.$cropBox.height(),
                width: this.$cropBox.width(),
                'background-position' : this.$cropBox.css('background-position')
                // 'background-position-y' : this.$cropBox.css('background-position-y'),
                // 'background-position-x' : this.$cropBox.css('background-position-x')
            });

            this.$cropBox.detach();
            this.$cropOverlay.detach();
            this.active = false;
            this.brick.enable();
            this.update();
            wigEvents.trigger('changepoint', 'Crop');
        }
    });

    return CropControl;
});