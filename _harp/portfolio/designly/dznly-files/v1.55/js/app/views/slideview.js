
define([
    'underscore',
    'backbone',
    'jquery',
    'app/views/brickfull',
    'app/models/template',
    'app/wigevents',
    'app/loadtemplate',
    'app/views/groupedit',
    'app/views/negspace',
    'app/models/stylegroup',
    'filepicker'
    ], 
function(_, Backbone, $, BrickFull, Template, wigEvents, loadTemplate, GroupEdit, NegSpace, StyleGroup, filepicker) {
    var appView;

    var dbEventer = _.debounce(function(name) {
        wigEvents.trigger('changepoint', name);
    }, 700);

    var SlideView = Backbone.View.extend({
        tagName: 'div',
        className: 'slide',
        events: {
            'click' : function(evt) {
                evt.preventDefault();
                // evt.stopPropagation();
                // this.model.trigger('activate:slide', this.model);
                if(this.$slideInt.is(evt.target)) {
                    if(!this.isActive) {
                        this.activate();
                    }
                    this.model.bc.deactivateAll();
                }
            },
            'click .change-color' : function(evt) {
                var sv = this;
                evt.stopPropagation();
                wigEvents.trigger('pickcolor', $(evt.target), 'absolute', this.$el.css('background-color'));
                wigEvents.on('colorpicked', function(hex) {
                    sv.$el.css({
                        'background-color' : hex,
                        'background-image' : ''
                    });
                    sv.model.set('slide_style', sv.$el.attr('style'));
                    dbEventer('Change Section Color');
                });
            },
            'click .change-image' : function(evt) {
                var sv = this;
                filepicker.pickAndStore({
                    mimetype: 'image/*',
                    multiple: false
                },
                {
                    location: 'S3',
                    access: 'public'
                },
                function(fpfiles) {
                    var url = window.config.UPLOADS_URL + window.encodeURIComponent(fpfiles[0].key);
                    sv.$el.css({
                        'background-color' : '',
                        'background-image': 'url("' + url + '")'
                    });
                    sv.model.set('slide_style', sv.$el.attr('style'));
                    wigEvents.trigger('changepoint', 'Change Section Image');
                });
            },
            'click .adv-background': function() {
                wigEvents.trigger('bkg:settings', this.model);
            },
            'click .delete-slide' : 'deleteSlide',
            'click .save-template' : function(evt) {
                this.saveAsTemplate();
            },
            'click .move-slide-up' : function(evt) {
                this.model.orderUp();
                this.model.collection.trigger('render:now');
                wigEvents.trigger('changepoint', 'Move Section Up');
            },
            'click .move-slide-down': function(evt) {
                this.model.orderDown();
                this.model.collection.trigger('render:now');
                wigEvents.trigger('changepoint', 'Move Section Down');
            },
            'click .add-slide-above': function(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                this.addSlide('above');
            },
            'click .add-slide-below': function(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                this.addSlide('below');
            },
            'click .copy-slide': function(evt) {
                this.copySlide();
            },
            'mousedown .resize-slide': function(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                var startPos = {
                    x: evt.pageX,
                    y: evt.pageY,
                    height: this.$slideInt.height()
                },
                cv = this;
                $(window).on('mousemove', moveHandler)
                .on('mouseup', upHandler);

                var origMargin = cv.$el.css('margin-bottom');

                this.$('.slide-resizer').show();
                $('.controls.right').css({
                    'pointer-events': 'none'
                });

                function moveHandler(evt) {
                    evt.preventDefault();
                    var xDiff = evt.pageX - startPos.x,
                    yDiff = evt.pageY - startPos.y;

                    cv.$slideInt.css({
                        height: startPos.height + yDiff
                        // 'margin-bottom':  -1 * yDiff + 'px'
                    });

                    var margin = -1 * yDiff;
                    margin = margin < 0 ? 0 : margin;
                    margin = margin + 'px';

                    cv.$el.css({
                        'margin-bottom': margin,
                        height: startPos.height + yDiff
                    });
                }

                function upHandler(evt) {
                    cv.$('.slide-resizer').hide();
                    $(window).off('mousemove', moveHandler)
                    .off('mouseup', upHandler);
                    cv.model.set('height', cv.$slideInt.height());
                    cv.$el.css({
                        'margin-bottom': '',
                        height: ''
                    });
                    $('.controls.right').css({
                        'pointer-events': ''
                    });
                    cv.adjustResizer();
                    wigEvents.trigger('changepoint', 'Resize Slide');
                }
            },
            'mousedown' : function(evt){
                evt.preventDefault();
                evt.stopPropagation();
                var addTo = [];
                var sv = this;
                var pbBoxList;
                var slideBox = sv.$slideInt.getBox();

                //deselect everything
                if(evt.metaKey || evt.shiftKey) {
                    addTo = _.clone(this.model.bc.getActive());
                } else {
                    this.model.bc.deactivateAll();
                }

                pbBoxList = _.reject(sv.model.bc.getBoxes(), function(pbBox) {
                    return _.indexOf(addTo, pbBox.pb) > -1;
                });

                var selectBox = $('<div id="select-box" style="z-index:99999; background-color: rgba(0,0,0,0.05); border: 1px solid #CCC; position: absolute;"></div>');
                $("body").append(selectBox);

                var selectBoxBox = selectBox.getBox();

                var startPos = {
                    x: evt.pageX,
                    y: evt.pageY
                };

                var drawSelectBox = function(startPos, selectPos){
                    selectBox.css({
                        width  : Math.abs(selectPos.x - startPos.x),
                        height : Math.abs(selectPos.y - startPos.y),
                        left   : ((startPos.x < selectPos.x) ? startPos.x : selectPos.x),
                        top    : ((startPos.y < selectPos.y) ? startPos.y : selectPos.y)
                    });
                };

                $(window).on('mousemove', selectHandler)
                .on('mouseup', upHandler);

                function selectHandler(evt) {
                    evt.preventDefault();
                    var newX = evt.pageX,
                        newY = evt.pageY;

                    var selectPosition = {
                        width  : Math.abs(newX - startPos.x),
                        height : Math.abs(newY - startPos.y),
                        left   : ((startPos.x < newX) ? startPos.x : newX),
                        top    : ((startPos.y < newY) ? startPos.y : newY)
                    };

                    selectBoxBox = (new Box( 
                        selectPosition.top,
                        selectPosition.left,
                        selectPosition.height,
                        selectPosition.width
                    )).relativeTo(slideBox);

                    drawSelectBox(startPos, {x: newX, y: newY});

                    _.each(pbBoxList, function(pbBox) {
                        var overlap = pbBox.box.overlap(selectBoxBox);
                        if( overlap && !pbBox.pb.view.active) {
                            pbBox.pb.view.activate(true);
                        } else if(!overlap && pbBox.pb.view.active){
                            pbBox.pb.view.deactivate();
                        }
                    });

                    //activate selection
                    // sv.model.bc.activateSelected(selectPosition, addTo);
                }

                function upHandler(evt) {
                    $(window).off('mousemove', selectHandler(evt))
                    .off('mouseup', upHandler);
                    $('#select-box').remove();
                }
            }
        },
        initialize: function() {
            this.appView = require('app/appview');
            var sv = this;
            this.isActive = false;
            this.normalEvents = true;

            this.listenTo(this.model, 'updownenable', function(enableString) {
                this.$slideUp.addClass('disabled');
                this.$slideDown.addClass('disabled');
                if(enableString.match('U')) {
                    this.$slideUp.removeClass('disabled'); // bootstrap class
                }
                if(enableString.match('D')) {
                    this.$slideDown.removeClass('disabled'); // bootstrap class
                }
            });

            this.listenTo(this.model.bc, 'activechange', function(active) {
                if(!this.isActive && active.length > 0) {
                    this.activate();
                }
                if(this.isActive) {
                    wigEvents.trigger('activechange', active);
                }
            });

            var enterHandler = function() {
                wigEvents.trigger('pagedragenter', sv);
                // $slideInt.off('mouseup', upHandler);
            };

            var leaveHandler = function() {
                wigEvents.trigger('pagedragleave', sv);
            };

            this.listenTo(wigEvents, 'pagedragstart', function(active) {
                // this.$slideInt.css({
                //     overflow: 'visible'
                // });
                this.$el.on('mouseenter', enterHandler);
                this.$el.on('mouseleave', leaveHandler);
            });

            this.listenTo(wigEvents, 'pagedragend', function() {
                this.$el.off('mouseenter', enterHandler);
                this.$el.off('mouseleave', leaveHandler);
                if(!this.isActive) {
                    this.$slideInt.css({
                        overflow: 'hidden'
                    });
                }
            });
        },
        brickDrop: function(pbList) {
            var sv = this;
            if(pbList.length > 0) {
                //is this brick already in another slide?
                if(pbList[0].collection) {
                    if(pbList[0].collection !== this.model.bc) {
                        pbList[0].collection.deactivateAll();
                        _.each(pbList, function(pb) {
                            pb.view.$el.css(
                                pb.view.$el.getBox().relativeTo(sv.$slideInt.getBox()).justBox()
                            );
                            pb.collection.remove(pb);
                            sv.model.bc.addAndOrder(pb);
                            pb.view.activate(true);
                        });
                    }
                } else {
                    var pos = pbList[0].get('position'),
                    posBox = new Box(pos.top, pos.left, pos.height, pos.width),
                    pb = pbList[0];
                    var newPosBox = posBox.relativeTo(sv.$slideInt.getBox());
                    pb.set('position', {
                        top: newPosBox.top,
                        left: newPosBox.left,
                        right: newPosBox.right,
                        bottom: newPosBox.bottom,
                        height: newPosBox.height,
                        width: newPosBox.width
                    });
                    sv.model.bc.addAndOrder(pb);
                    pb.view.activate(false);
                    pb.updateBox();
                }
            }
        },
        adjustResizer: function() {
            var height = this.$slideInt.height();
            var $resizer = this.$('.controls.bottom button');
            if(height < 108) {
                $resizer.parent().addClass('side-step');
            } else {
                $resizer.parent().removeClass('side-step');
            }
        },
        render: function() {
            var cv = this,
            brickCollection = this.model.bc;

            this.$el.append(loadTemplate('slideview-tmp'))
            .attr('style', this.model.get('slide_style'));

            var serverID = this.model.get('id');

            this.$name = this.$('.slide-count');

            if(serverID) {
                this.$el.attr('id', 'section-' + serverID);
            } else {
                this.listenToOnce(this.model, 'change:id', function(slide, id) {
                    this.$el.attr('id', 'section-' + id);
                });
            }

            this.$slideInt = this.$('.slide-int')
            .css({
                'height' : this.model.get('height')
            });

            this.adjustResizer();

            this.$num = this.$('.slide-count .number');

            this.listenTo(wigEvents, 'showslidenums', function() {
                this.$name.show();
            });

            this.listenTo(wigEvents, 'hideslidenums', function() {
                this.$name.hide();
            });

            this.listenTo(this.model.collection, 'render:now', function() {
                this.$num.text(this.model.collection.indexOf(this.model) + 1);
            });

            //NATE
            this.groupEdit = new GroupEdit();
            this.groupEdit.render();
            this.$slideInt.append(this.groupEdit.el);
            this.groupEdit.$el.hide();
            if(this.appView.grid){
                this.$slideInt.addClass('grid');
            }

            this.groupEdit.listenTo(this.model.bc, 'activechange keyboardmove', function(active){
                if(active.length === 0) {
                    this.$el.hide();
                    this.bricks = [];
                } else {
                    this.$el.show();
                    this.bricks = active;
                    this.updateBox(active);
                }
            });
            this.groupEdit.listenTo(this.model.bc, 'startdrag', function(evt){
                this.startDrag(evt);
            });
            this.groupEdit.listenTo(this.model.bc, 'moveby', function(pos){
                this.moveBy(pos);
            });
            this.groupEdit.listenTo(this.model.bc, 'enddrag', function(evt){
                this.endDrag(evt);
            });
            this.groupEdit.listenTo(this.model.bc, 'movegroup', function(pb, pos){
                this.moveGroupTo(pos);
            });

            this.groupEdit.slide = this.$slideInt;
            //ENDNATE

            this.$settingsMenu = this.$('.slide-settings-group');
            this.$slideUp = this.$('.move-slide-up').parent();
            this.$slideDown = this.$('.move-slide-down').parent();

            if(!window.is_staff) {
                this.$('.save-template').remove();
            }

            this.listenTo(brickCollection, 'add', function(pb) {
                if(!pb.view) {
                    pb.view = new BrickFull({model: pb});
                    pb.styleGroup = new StyleGroup(pb.get('style_group'), {'$el': pb.view.$el});
                    wigEvents.trigger('style:newgroup', pb.styleGroup);
                    pb.view.render();
                    pb.contentStyle = new StyleGroup(pb.get('content_style_group'), {'$el' : pb.view.$content});
                    wigEvents.trigger('style:newgroup', pb.contentStyle);
                }
                pb.view.$el
                .css({
                    'z-index': pb.get('stackOrder'),
                    width: pb.view.$el.width()
                })
                .appendTo(cv.$slideInt);
                pb.view.activateControls(cv);
                if(pb.get('category') === 'Embed') {
                    pb.view.$el.tooltip('fixTitle');
                }
                pb.updateBox();
            });

            brickCollection.forEach(function(pb) {
                // pb.view = new BrickFull({model: pb});
                brickCollection.trigger('add', pb);
            });

            this.listenTo(brickCollection, 'remove', function(pb) {
                wigEvents.trigger('style:removegroup', pb.styleGroup);
                wigEvents.trigger('style:removegroup', pb.contentStyle);
                pb.view.$el.tooltip('destroy');
                pb.view.removeAll();
            });
            this.listenTo(brickCollection, 'change:stackOrder', function(pb, stackOrder) {
                pb.view.$el.css('z-index', stackOrder);
            });

            this.negSpace = new NegSpace();
            this.negSpace.render();
            var updateNegPos = function() {
                var offset = cv.$slideInt.offset();
                cv.negSpace.setPos(offset.left);
            };
            $(window).on('resize', updateNegPos);
            this.listenTo(this.model.collection, 'change:height', function() {
                this.negSpace.update(this.model.bc, this.model);
            });
            this.$el.prepend(this.negSpace.el);

            this.listenTo(wigEvents, 'grid:on', function() {
                updateNegPos();
                this.negSpace.show();
                this.negSpace.update(this.model.bc, this.model);
                this.negSpace.listenTo(cv.model.bc, 'change:position remove', function() {
                    this.update(cv.model.bc, cv.model);
                });
                this.negSpace.listenTo(cv.model.bc, 'add', function() {
                    _.delay(function() {
                        cv.negSpace.update(cv.model.bc, cv.model);
                    }, 10);
                });
            });

            var bricksBelow = [];
            var resizeHandler = function(spacer, yDiff) {
                _.each(bricksBelow, function(pb) {
                    pb.view.$el.css({
                        top: pb.view.$el.position().top + yDiff
                    });
                });
                cv.$slideInt.css({
                    height: cv.$slideInt.height() + yDiff
                });
                cv.groupEdit.trigger('groupbox:update');
            };
            var stopHandler = function(spacer) {
                _.each(bricksBelow, function(pb) {
                    pb.updateBox();
                });
                cv.model.set('height', cv.$slideInt.height());
                cv.stopListening(cv.negSpace.spacers, 'spacer:resize', resizeHandler);
                cv.stopListening(cv.negSpace.spacers, 'spacer:resizeend', stopHandler);
            };

            this.listenTo(this.negSpace.spacers, 'spacer:resizestart', function(spacer) {
                var spacerBottom = spacer.get('top') + spacer.get('height');
                bricksBelow = this.model.bc.filter(function(pb) {
                    return pb.get('position').top >= spacerBottom;
                });
                this.listenTo(this.negSpace.spacers, 'spacer:resize', resizeHandler);
                this.listenTo(this.negSpace.spacers, 'spacer:resizeend', stopHandler);
            });

            this.listenTo(wigEvents, 'grid:off', function() {
                this.negSpace.hide();
                this.negSpace.stopListening(cv.model.bc, 'change:position');
            });

            return this;
        },
        renderAll: function() {
            var slideView = this;
            this.render();
            this.model.bc.forEach(function(pb) {
                slideView.$slideInt.append(pb.view.render().el);
            });
            return this;
        },
        closestInside: function($elem) {
            var e_box = this.getBox($elem),
            box = this.getBox(this.$slideInt),
            dest = {
                top: e_box.top,
                left: e_box.left
            };

            if(e_box.left < box.left) {
                dest.left = box.left;
            } else if( e_box.right > box.right ) {
                dest.left = box.right - e_box.width;
            }

            if(e_box.top < box.top) {
                dest.top = box.top;
            } else if(e_box.bottom > box.bottom) {
                dest.top = box.bottom - e_box.height;
            }

            return dest;
        },
        getBox: function($elem) {
            var offset = $elem.offset();
            return {
                top: offset.top,
                left: offset.left,
                bottom: offset.top + $elem.height(),
                right: offset.left + $elem.width(),
                width: $elem.width(),
                height: $elem.height()
            };
        },
        pointInside: function(offset) {
            var box = this.getBox(this.$slideInt);

            if(offset.left < box.left) {
                return false;
            } else if(offset.left > box.right) {
                return false;
            }

            if(offset.top < box.top) {
                return false;
            } else if(offset.top > box.bottom) {
                return false;
            }
            return true;
        },
        anyPartInside: function($elem) {
            var e_box = $elem.getBox(),
            box = this.$slideInt.getBox();
            return e_box.overlap(box);
        },
        deleteSlide: function(evt) {
            if(confirm('Press OK to delete this section')) {
                this.model.collection.remove(this.model);
                wigEvents.trigger('changepoint', 'Delete Section');
            }
        },
        viewPortMiddle: function() {
            return this.$slideInt.inViewPort({top: 145});
        },
        deactivate: function(fade) {
            this.isActive = false;
            this.model.bc.deactivateAll();
            this.$slideInt.css({
                'overflow': 'hidden'
            });
            if(fade) {
                this.$el.addClass('inactive');
                this.delegateEvents({
                    'click' : function(evt) {
                        this.activate();
                        // this.appView.setActiveSlide(this);
                    },
                    'click .controls' : function(evt) {
                        this.$settingsMenu.slideDown(150);
                    }
                });
                this.normalEvents = false;
                this.model.bc.forEach(function(pb){
                    pb.view.disable();
                });
            } else {
                this.$el.removeClass('inactive');
                if(!this.normalEvents) {
                    this.delegateEvents(this.events);
                    this.model.bc.forEach(function(pb){
                        pb.view.enable();
                    });
                    this.normalEvents = true;
                }
            }
        },
        activate: function() {
            this.isActive = true;
            this.$el.removeClass('inactive');
            this.$slideInt.css({
                'overflow': 'visible'
            });
            this.model.trigger('activate:slide', this.model);
            if(!this.normalEvents) {
                this.delegateEvents(this.events);
                this.model.bc.forEach(function(pb){
                    pb.view.enable();
                });
                this.normalEvents = true;
            }
            // this.model.bc.forEach(function(pb){
            //     pb.view.enable();
            // });
        },
        saveAsTemplate: function() {
            this.model.set('is_template', true);
            this.model.save();
            // var template = new Template(_.omit(this.model.toJSON(), ['id', 'resource_uri', 'stack']));
            // template.save();
        },
        addSlide: function(position) {
            var indexDiff = 0;
            var orderIndex;
            var stack = this.appView.stack;
            if(position === 'above') {
                indexDiff = 0;
            } else if(position === 'below') {
                indexDiff = 1;
            }
            orderIndex = this.model.get('order_index') + indexDiff;
            this.appView.templatePicker.show();
            this.appView.templatePicker.once('picked', function(templateSlide) {
                if(!window.config.DEMO) {
                    stack.sc.create({
                        name: 'New Slide',
                        stack: stack.get('resource_uri'),
                        bricks: _.clone(templateSlide.get('bricks')),
                        height: templateSlide.get('height'),
                        slide_html: templateSlide.get('slide_html'),
                        slide_style: templateSlide.get('slide_style')
                    }, {
                        at: orderIndex
                    });
                } else {
                    stack.sc.add({
                        name: 'New Slide',
                        stack: stack.get('resource_uri'),
                        bricks: _.clone(templateSlide.get('bricks')),
                        height: templateSlide.get('height'),
                        slide_html: templateSlide.get('slide_html'),
                        slide_style: templateSlide.get('slide_style')
                    }, {
                        at: orderIndex
                    });
                }
                // stack.sc.add(slide);
                stack.sc.trigger('render:now');
                wigEvents.trigger('changepoint', 'Add Section');
                slideToggles();
            });

        },
        copySlide: function() {
            this.model.collection.create(this.model.cloneJSON(), {
                at: this.model.get('order_index') + 1
            });
            this.model.collection.trigger('render:now');
            wigEvents.trigger('changepoint', 'Copy Section');
        }
    });

    return SlideView;
});