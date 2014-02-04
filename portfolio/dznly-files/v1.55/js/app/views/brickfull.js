
define([
    'underscore',
    'backbone',
    'jquery',
    'app/appview',
    'app/models/placedbrick',
    'app/modalcontrols',
    'app/wigevents',
    'snaps',
    'jqbox'
    ], 
    function(_, Backbone, $, appView, PlacedBrick, modal_controls, wigEvents) {
    var BrickFull = Backbone.View.extend({
        tagName:'div',
        className: 'brick-full',
        placed: true,
        active: false,
        editing: false,
        rendered: false,
        initialize: function() {
            this.modals = [];
            appView = require('app/appview');
        },
        render: function() {
            if(!this.rendered) {
                var pos = this.model.get('position');
                var $content = $(this.model.get('html')).addClass('brick-content');

                if(this.model.get('category') === 'Embed') {
                    var ec = this.model.get('embed_code');
                    if(ec) {
                        try {
                            $content.find('.embed-wrap').html(ec.replace(/wwscr/g, 'script'));
                        } catch (e) {
                            
                        }
                    } else {
                        this.model.set('embed_code', $content.find('.embed-wrap').html());
                    }
                    this.$el.attr('data-original-title', 'Your embedded content may go blank during editing, but it will still appear on your saved page.').tooltip('fixTitle');
                }

                // $content.find('wwscr').each(function() {
                //     var $wwscr = $(this);
                //     var $scr = $('<script type="text/javascript"></script').html($wwscr.html());
                //     $wwscr.replaceWith($scr);
                // });
                this.$content = $content.appendTo(this.el);

                this.$el.attr('style', this.model.get('style'))
                .css({
                    top: pos.top,
                    left: pos.left,
                    width: pos.width,
                    height: pos.height
                });

                var style = this.$content.attr('style') || '';

                if(!style.match(/font-family/)) {
                    this.$content.css({
                        'font-family': 'Open Sans'
                    });
                }

                var wrapper = this.model.get('wrapper');
                if(wrapper !== '') {
                    this.$content.wrap(wrapper);
                }

                if(this.model.get('category') === 'Embed') {
                    if(this.$content.has('.embed-cover.dznly-remove').length === 0) {
                        this.$content.append('<div class="embed-cover dznly-remove"></div>');
                    }
                }

                this.$spinner = $('<div class="dznly-remove"><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="48px" height="48px" viewbox="0 0 48 48" enable-background="new 0 0 16 16" xml:space="preserve" fill="#000000" class="svg replaced-svg"> <path d="M 45.00,27.00l-6.00,0.00 c-1.659,0.00-3.00-1.341-3.00-3.00c0.00-1.656, 1.341-3.00, 3.00-3.00l6.00,0.00 c 1.659,0.00, 3.00,1.344, 3.00,3.00C 48.00,25.659, 46.659,27.00, 45.00,27.00z M 36.726,15.516c-1.173,1.173-3.069,1.173-4.242,0.00s-1.173-3.069,0.00-4.242l 4.242-4.245 c 1.173-1.17, 3.069-1.17, 4.242,0.00c 1.173,1.173, 1.173,3.072,0.00,4.245L 36.726,15.516z M 24.00,48.00c-1.656,0.00-3.00-1.341-3.00-3.00l0.00,-6.00 c0.00-1.656, 1.344-3.00, 3.00-3.00 c 1.659,0.00, 3.00,1.344, 3.00,3.00l0.00,6.00 C 27.00,46.659, 25.659,48.00, 24.00,48.00z M 24.00,12.00C 22.344,12.00, 21.00,10.659, 21.00,9.00L21.00,3.00 c0.00-1.656, 1.344-3.00, 3.00-3.00c 1.659,0.00, 3.00,1.344, 3.00,3.00l0.00,6.00 C 27.00,10.659, 25.659,12.00, 24.00,12.00z M 11.271,40.971c-1.173,1.173-3.069,1.173-4.242,0.00s-1.173-3.072,0.00-4.242l 4.242-4.245 c 1.173-1.17, 3.072-1.17, 4.242,0.00c 1.173,1.173, 1.173,3.072,0.00,4.245L 11.271,40.971z M 11.271,15.516L 7.029,11.274 c-1.173-1.173-1.173-3.072,0.00-4.245c 1.173-1.17, 3.069-1.17, 4.242,0.00l 4.242,4.245c 1.173,1.173, 1.173,3.069,0.00,4.242 C 14.343,16.686, 12.444,16.686, 11.271,15.516z M 12.00,24.00c0.00,1.659-1.344,3.00-3.00,3.00L3.00,27.00 C 1.344,27.00,0.00,25.659,0.00,24.00c0.00-1.656, 1.344-3.00, 3.00-3.00l6.00,0.00 C 10.656,21.00, 12.00,22.344, 12.00,24.00z M 36.726,32.484l 4.242,4.245c 1.173,1.17, 1.173,3.069,0.00,4.242s-3.069,1.173-4.242,0.00l-4.242-4.242c-1.173-1.173-1.173-3.072,0.00-4.245 C 33.657,31.314, 35.556,31.314, 36.726,32.484z"></path></svg></div>');
                this.$spinner.find('svg').attr('style', '-webkit-animation:spin 2s infinite linear;-moz-animation:spin 2s infinite linear;animation:spin 2s infinite linear;');
                this.$spinner.css({
                    position: 'absolute',
                    width: 48,
                    height: 48,
                    top: '50%',
                    left: '50%',
                    'margin-left': '-24px',
                    'margin-top' : '-24px'
                });

                this.rendered = true;
            }
            // this.activateControls();
            return this;
        },
        showSpinner: function() {
            this.$spinner.appendTo(this.el);
        },
        hideSpinner: function() {
            this.$spinner.detach();
        },
        setContent: function(contentOuter) {
            var $content = $(contentOuter);
            this.$content.replaceWith($content);
            this.$content = $content;
        },
        startDrag: function(evt) {
            // this.moveTo(evt);

            this.$el.css({
                top: Math.round(evt.pageY - (this.$el.height() / 2)),
                left: Math.round(evt.pageX - (this.$el.width() / 2)),
                'z-index': 99999999
            })
            .show()
            .addClass('not-droppable');
        },
        moveBy: function(evt, pointer_offset, start) {
            var bounded, pos,
            xDiff = evt.pageX - pointer_offset.x,
            yDiff = evt.pageY - pointer_offset.y,
            canvas_view = appView.activeSlide,
            brickCollection = this.model.collection;
            if(start) {
                pos = this.$el.position();
                this.startPos = {
                    top: pos.top,
                    left: pos.left
                };
            }

            this.model.trigger('moveby', {x: xDiff, y: yDiff, evt: evt});

            // if(canvas_view.anyPartInside(this.$el)) {
            //     this.$el.addClass('droppable')
            //     .removeClass('not-droppable');
            // } else {
            //     this.$el.addClass('not-droppable')
            //     .removeClass('droppable');
            // }
        },
        moveTo: function(evt, pointer_offset) {
            pointer_offset = pointer_offset ? pointer_offset : { x : 0, y : 0 };
            this.$el.css({
                top: evt.pageY - Math.round(this.$el.height() / 2),
                left: evt.pageX - Math.round(this.$el.width() / 2),
            });
        },
        endDrag: function(evt) {
            var offset = this.$el.offset(),
            canvas_offset = appView.activeSlide.$el.offset(),
            placedBrick,
            canvas_view = appView.activeSlide,
            brickCollection = appView.activeSlide.model.bc;

            if(!this.placed) {
                if(canvas_view.pointInside({ top: evt.pageY, left: evt.pageX })) {
                    this.placeBrick();
                    if(this.placed) {
                        this.model.updateBox();
                    }
                    return true;
                }
            } else {
                this.placeBrick();
                if(this.placed) {
                    this.model.updateBox();
                }
                return true;
            }
            if(!this.placed) {
                this.$el.hide();
            } else {
                brickCollection.remove(this.model);
                // this.removeAll();
            }
            return false;
        },
        placeBrick: function() {
            if(!this.placed) {
                placedBrick = new PlacedBrick(this.model.attributes);
                placedBrick.set('position', this.$el.getBox().
                    relativeTo(appView.activeSlide.$slideInt.getBox())
                    .justBox());
                placedBrick.firstPlacement = true;
                // placedBrick.updateBox();
                appView.activeSlide.model.bc.addAndOrder(placedBrick);
                placedBrick.view.activate(false);
                // this.activateControls();
                // this.placed = true;
                this.$el.hide();
                wigEvents.trigger('changepoint', 'Add ' + this.model.get('name'));

            }
            this.$el.removeClass('droppable')
            .removeClass('not-droppable');
        },
        activateControls: function() {
            var brick = this,
            moved = false;
            if(this.modals.length === 0) {
                _.each(modal_controls, function(Modal) {
                    var modal = new Modal({brick: brick});
                    if(_.indexOf(modal.targets, brick.model.get('name')) > -1) { 
                        // modal.render().$el.appendTo(brick.el);
                        // modal.show();
                        brick.modals.push(modal);
                    } else {
                        modal.remove();
                    }
                });
                if(this.model.firstPlacement) {
                    this.trigger('pickimage');
                    this.trigger('embed');
                    this.model.firstPlacement = false;
                }
            }
            this.delegateEvents({
                'contextmenu': function(evt) {
                    if(!this.editing) {
                        return false;
                    }
                },
                'click a' : function(evt) {
                    evt.preventDefault();
                },
                'mouseover' : function() {
                    if(!this.active) {
                        // this.showControls('hover');
                        this.$el.addClass('hover');
                    }
                },
                'mouseout' : function() {
                    if(!this.active) {
                        // this.showControls('reset');
                        this.$el.removeClass('hover');
                    }
                },
                'mousedown' : function(evt) {
                    evt.preventDefault();
                    evt.stopPropagation();

                    if(!this.active && !evt.metaKey && !evt.shiftKey){
                        this.activate(false);
                        // this.showControls('active');
                    } else if(!this.active) {
                        this.activate(true);
                    } else if(this.active && (evt.metaKey || evt.shiftKey)) {
                        this.deactivate();
                    }

                    var brick = this,
                    offset = this.$el.offset(),
                    pointer_offset = {
                        x: evt.pageX,
                        y: evt.pageY
                    },
                    start = true,
                    active = brick.model.collection.getActive();

                    moved = false;
                    if(!this.editing) {
                        brick.model.trigger('startdrag', evt);
                        wigEvents.trigger('pagedragstart');
                        this.destinationSV = false;
                        brick.listenTo(wigEvents, 'pagedragenter', function(sv) {
                            this.destinationSV = sv;
                            _.each(active, function(pb){
                                pb.view.$el.addClass('moving');
                            });
                        });

                        evt.preventDefault();
                        function moveHandler(evt) {
                            evt.preventDefault();
                            if(moved) {
                                start = false;
                            } else {
                                moved = true;
                                _.each(active, function(pb) {
                                    pb.view.$el.css({
                                        'pointer-events' : 'none'
                                    });
                                });
                            }
                            brick.moveBy(evt, pointer_offset, start);
                            // if(brick.active) {
                            //     _.each(brick.model.collection.getActive(), function(pb) {
                            //         pb.view.moveBy(evt, pointer_offset, start);
                            //     });
                            // } else {
                            //     brick.moveBy(evt, pointer_offset, start);
                            // }
                        }
                        function upHandler(evt) {
                            $(window).off('mousemove', moveHandler)
                            .off('mouseup', upHandler);
                            brick.stopListening(wigEvents, 'pagedragenter');
                            if(brick.destinationSV) {
                                brick.destinationSV.brickDrop(active);
                                wigEvents.trigger('changepoint', 'Move');
                            } else {
                                if(brick.active) {
                                    _.each(active, function(pb) {
                                        pb.view.endDrag(evt);
                                    });
                                } else {
                                    brick.endDrag(evt);
                                }
                                if(moved) {
                                    wigEvents.trigger('changepoint', 'Move');
                                }
                                //brick.endDrag(evt);
                            }
                            brick.model.trigger('enddrag', evt);
                            wigEvents.trigger('pagedragend');
                            _.each(active, function(pb) {
                                pb.view.$el.css({
                                    'pointer-events' : ''
                                }).removeClass('moving');
                            });
                        }
                        $(window).mousemove(moveHandler)
                        .mouseup(upHandler);
                    }
                    if(evt.which === 3 && !brick.editing) {
                        wigEvents.trigger('rightclick', this.model);
                    }
                },
                'dblclick' : function(evt) {
                    evt.preventDefault();
                    if(this.model.get('category') === 'Text' || this.model.get('category') === 'Interactive') {
                        if(!this.active) {
                            this.activate(false);
                        }
                        if(!this.editing) {
                            this.startEdit();
                        }
                    }else if(this.model.get('category') === 'Embed') {
                        this.trigger('embed');
                    }else if(this.model.get('category') === 'Image') {
                        wigEvents.trigger('image:edit', this.model);
                    }
                }
            });
        },
        activate: function(multi) {
            //multi is a bool; true if it is an additive selection
            var canvas_view = appView.activeSlide;
            this.active = true;
            this.$el.removeClass('hover');
            // this.el.contentEditable = true;
            this.$el.addClass('active-brick');
            var insideOffset = canvas_view.closestInside(this.$el),
            offset = this.$el.offset();
            if(insideOffset.top !== offset.top || insideOffset.left !== offset.left) {
                canvas_view.$slideInt.css('overflow', 'visible');
            }
            this.model.trigger('activate', this.model, multi);
        },
        deactivate: function() {
            if(this.editing) {
                this.stopEdit();
            }
            this.active = false;
            this.editing = false;
            this.$el.removeClass('active-brick');
            this.model.trigger('deactivate', this.model);
        },
        startEdit: function() {
            if(this.$content.parent()[0].tagName === 'A') {
                var color = this.$content.parent().css('color');
                this.$content.unwrap();
                this.$content.wrap(
                    $('<span></span>').css({
                        color: color
                    })
                );
            }
            this.$el.find('a').css({
                'pointer-events' : 'none'
            });
            this.$content.wysiwyg();
            this.editing = true;
            wigEvents.trigger('edittext');
            this.$content.on('click', function(evt){
                evt.stopPropagation();
            })
            .on('mousedown', function(evt){
                evt.stopPropagation();
            })
            .on('mousemove', function(evt) {
                evt.stopPropagation();
            });

            if(this.$content.text() === 'Double Click to Add Heading' || this.$content.text() === 'Double Click To Add Text') {
                this.$content.text('')
                .blur()
                .focus();
            } else {
                this.$content.blur().focus();
            }

            var $el = this.$el;
            var $content = this.$content;

            //to prevent accidental navigation away from the page if the content is wrapped in an <a> tag
            this.clickPreventer = function(evt) {
                evt.preventDefault();
            };

            this.$content.on('click', this.clickPreventer);

            this.moveProxy = function(evt) {
                $(window).trigger({
                    type: 'mousemove',
                    pageX: evt.pageX,
                    pageY: evt.pageY
                });
            };

            this.$content.on('mousemove', this.moveProxy);

            this.pasteHandler = function(evt){
                var windowLoc = window.scrollY;
                $content.trigger('savesel');
                $el.append('<div id="copy-receiver"></div>');
                // $content.stopWysiwyg();
                var $cr = $el.find('#copy-receiver');
                // $cr.wysiwyg();
                $cr.attr('contenteditable', 'true');
                $cr.css({
                    opacity: '0'
                });
                $cr.focus();
                setTimeout(function() {
                    var oldContent = $content.html();
                    $cr.html($cr.html().replace(/\n/g, '')
                    .replace(/<div>/g,'')
                    .replace(/<\/div>/g,'<br>')
                    .replace(/<br[^>]*>/g, '\n'));
                    // try{ 
                    //     $content.trigger('command', 'insertHtml ' + $cr.text().replace(/\n/g, '<br>'));
                    // } catch(e) {
                    //     $content.html()
                    $content.trigger('command', 'insertText ' + $cr.text());
                    // $content.html($content.html() + $cr.text().replace(/\n/g, '<br>'));
                    // $cr.stopWysiwyg();
                    $cr.remove();
                    // $content.wysiwyg();
                    $content.focus();
                    window.scrollTo(0, windowLoc);
                }, 100);
            }

            $(window).on('keydown', null, 'ctrl+v meta+v', this.pasteHandler);

            this.tabHandler = function(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                $content.trigger('command', 'insertText ' + '    ');
            };

            $content.on('keydown', null, 'tab', this.tabHandler);
        },
        stopEdit: function() {
            if(this.$content.parent()[0].tagName === 'SPAN') {
                this.$content.unwrap();
                this.$content.wrap(this.model.get('wrapper'));
            }
            // this.$content.wrap(this.model.get('wrapper'));
            this.$el.find('*').css({
                'pointer-events' : ''
            });
            this.model.updateBox();
            window.getSelection().removeAllRanges();
            this.$content.stopWysiwyg();
            wigEvents.trigger('stopedittext');
            this.editing = false;
            this.$el.removeAttr('contentEditable');
            this.$content.off();
            if(this.$content.text() === '') {
                this.$content.html('Double Click To Add Text');
            } else {
                wigEvents.trigger('changepoint', 'Edit Text');
            }
            this.$content.off('click', this.clickPreventer);
            this.$content.off('mousemove', this.moveProxy);
            $(window).off('keydown', this.pasteHandler);
            this.$content.off('keydown', this.tabHandler);
        },
        removeAll: function() {
            $.each(this.modals, function() {
                this.remove();
            });
            if(this.editing) {
                this.stopEdit();
            }
            this.remove();
        },
        disable: function() {
            this.undelegateEvents();
            this.delegateEvents({
                'click a': function(evt){
                    evt.preventDefault();
                }
            });
        },
        enable: function() {
            this.activateControls();
        }
    });

    return BrickFull;
});