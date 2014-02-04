define([
    'underscore',
    'backbone',
    'app/views/barview',
    'app/wigevents',
    'filepicker'
    ],
function(_, Backbone, BarView, wigEvents, filepicker) {

    var dbEventer = _.debounce(function(name) {
        wigEvents.trigger('changepoint', name);
    }, 700);

    var BkgBar = BarView.extend({
        el: '.bkg-controls',
        events: {
            'click': function () {
                this.adjustButtons(this.slide.view.$el);
                this.slide.set('slide_style', this.slide.view.$el.attr('style'));
            },
            'click .bkg-set-image': function(evt) {
                evt.stopPropagation();
                var sv = this.slide.view;
                var bkg = this;
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
                        'background-image': 'url(' + url + ')'
                    });
                    sv.model.set('slide_style', sv.$el.attr('style'));
                    bkg.adjustButtons(sv.$el);
                    wigEvents.trigger('changepoint', 'Change Section Image');
                });
            },
            'click .bkg-edit-image' : function () {
                wigEvents.trigger('image:bkgedit', this.slide.view);
            },
            'click .bkg-remove-image': function() {
                this.slide.view.$el.css('background-image', '');
                wigEvents.trigger('changepoint', 'Remove Background Image');
            },
            'click .bkg-cover': function() {
                this.slide.view.$el.css('background-size', 'cover');
                wigEvents.trigger('changepoint', 'Set Background Image Cover');
            },
            'click .bkg-fixed': function() {
                this.slide.view.$el.css('background-size', 'auto');
                wigEvents.trigger('changepoint', 'Set Background Image Size');
            },
            'click .bkg-change-color': function(evt) {
                evt.stopPropagation();
                var sv = this.slide.view;
                var bkg = this;
                wigEvents.trigger('pickcolor', $(evt.target), 'fixed', sv.$el.css('background-color'));
                wigEvents.on('colorpicked', function(hex) {
                    sv.$el.css({
                        'background-color' : hex
                    });
                    sv.model.set('slide_style', sv.$el.attr('style'));
                    bkg.adjustButtons(sv.$el);
                    dbEventer('Change Section Color');
                });
            },
            'click .bkg-attachment': function() {
                if(this.$attached.hasClass('active')) {
                    this.slide.view.$el.css('background-attachment', 'scroll');
                    wigEvents.trigger('changepoint', 'Background Scrolls');
                } else {
                    this.slide.view.$el.css('background-attachment', 'fixed');
                    wigEvents.trigger('changepoint', 'Background Stays');
                }
            },
            'click .bkg-left' : function() {
                this.setPosition({ x : '0%'})
            },
            'click .bkg-center' : function() {
                this.setPosition({ x : '50%'})
            },
            'click .bkg-right' : function() {
                this.setPosition({ x : '100%'})
            },
            'click .bkg-top' : function() {
                this.setPosition({ y : '0%'})
            },
            'click .bkg-middle' : function() {
                this.setPosition({ y : '50%'})
            },
            'click .bkg-bottom' : function() {
                this.setPosition({ y : '100%'})
            },
            'click .bkg-xrepeat': function() {
                if(this.$repeatX.hasClass('active')) {
                    if(this.$repeatY.hasClass('active')) {
                        this.slide.view.$el.css({
                            'background-repeat' : 'no-repeat repeat'
                        });
                    } else {
                        this.slide.view.$el.css({
                            'background-repeat' : 'no-repeat'
                        });
                    }
                } else {
                    if(this.$repeatY.hasClass('active')) {
                        this.slide.view.$el.css({
                            'background-repeat' : 'repeat'
                        });
                    } else {
                        this.slide.view.$el.css({
                            'background-repeat' : 'repeat no-repeat'
                        });
                    }
                }
                wigEvents.trigger('changepoint', 'Change Background Repeat');
            },
            'click .bkg-yrepeat': function() {
                if(this.$repeatY.hasClass('active')) {
                    if(this.$repeatX.hasClass('active')) {
                        this.slide.view.$el.css({
                            'background-repeat' : 'repeat no-repeat'
                        });
                    } else {
                        this.slide.view.$el.css({
                            'background-repeat' : 'no-repeat'
                        });
                    }
                } else {
                    if(this.$repeatX.hasClass('active')) {
                        this.slide.view.$el.css({
                            'background-repeat' : 'repeat'
                        });
                    } else {
                        this.slide.view.$el.css({
                            'background-repeat' : 'no-repeat repeat'
                        });
                    }
                }
                wigEvents.trigger('changepoint', 'Change Background Repeat');
            },
            'click .bkg-close' : function() {
                this.slide.view.$el.trigger('mousedown');
            }
        },
        barInit: function() {
            this.types = [];
            this.name = 'background';
            // this.listenTo(wigEvents, 'bkg:settings', function(slide) {
            //  this.slide = slide;
            //  this.adjustButtons(slide.view.$el);
            // });
        },
        setSlide: function(slide) {
            this.slide = slide;
            this.adjustButtons(slide.view.$el);
        },
        render: function() {
            this.$imgRemove = this.$('.bkg-remove-image');
            this.$bkgCover = this.$('.bkg-cover');
            this.$bkgFixed = this.$('.bkg-fixed');
            this.$sizeGroup = this.$('.bkg-size-group');
            this.$attached = this.$('.bkg-attachment');

            this.$positionGroup = this.$('.bkg-position-group');

            this.$left = this.$('.bkg-left');
            this.$center = this.$('.bkg-center');
            this.$right = this.$('.bkg-right');

            this.$top = this.$('.bkg-top');
            this.$middle = this.$('.bkg-middle');
            this.$bottom = this.$('.bkg-bottom');

            this.$repeatX = this.$('.bkg-xrepeat');
            this.$repeatY = this.$('.bkg-yrepeat');

            this.listenTo(wigEvents, 'cancelall', function() {
                var bkg = this;
                if(this.slide) {
                    _.delay(function() {
                        bkg.adjustButtons(bkg.slide.view.$el);
                    }, 1);
                }
            });

            return this;
        },
        hide: function() {
            this.slide = false;
            this.$el.hide();
            this.undelegateEvents();
        },
        setPosition: function(pos) {
            var split = this.slide.view.$el.css('background-position').split(' ');
            var position = {
                x: split[0] || '50%',
                y: split[1] || '50%'
            };
            _.extend(position, pos);
            this.slide.view.$el.css({
                'background-position' : position.x + ' ' + position.y
            });
            wigEvents.trigger('changepoint', 'Change Background Position');
        },
        adjustButtons : function($el) {
            var bkgState = {
                size: $el.css('background-size'),
                position: $el.css('background-position').split(' '),
                repeat: $el.css('background-repeat').split(' '),
                attachment: $el.css('background-attachment'),
                image: $el.css('background-image')
            };

            if(bkgState.size === 'cover') {
                this.$sizeGroup.addClass('disabled');
                this.$positionGroup.addClass('disabled');
                this.$bkgCover.addClass('active');
                this.$bkgFixed.removeClass('active');
            } else {
                this.$sizeGroup.removeClass('disabled');
                this.$positionGroup.removeClass('disabled');
                this.$bkgCover.removeClass('active');
                this.$bkgFixed.addClass('active');
            }

            if(_.first(bkgState.position) === '0%') {
                this.$left.addClass('active');
                this.$center.removeClass('active');
                this.$right.removeClass('active');
            } else if(_.first(bkgState.position) === '50%') {
                this.$left.removeClass('active');
                this.$center.addClass('active');
                this.$right.removeClass('active');
            } else if(_.first(bkgState.position) === '100%') {
                this.$left.removeClass('active');
                this.$center.removeClass('active');
                this.$right.addClass('active');
            }

            if(_.last(bkgState.position) === '0%') {
                this.$top.addClass('active');
                this.$middle.removeClass('active');
                this.$bottom.removeClass('active');
            } else if(_.last(bkgState.position) === '50%') {
                this.$top.removeClass('active');
                this.$middle.addClass('active');
                this.$bottom.removeClass('active');
            } else if(_.last(bkgState.position) === '100%') {
                this.$top.removeClass('active');
                this.$middle.removeClass('active');
                this.$bottom.addClass('active');
            }

            if(_.first(bkgState.repeat) === 'repeat' && _.last(bkgState.repeat) === 'repeat') {
                this.$repeatX.addClass('active');
                this.$repeatY.addClass('active');
            } else if (_.first(bkgState.repeat) === 'repeat' || _.first(bkgState.repeat) === 'repeat-x') {
                this.$repeatX.addClass('active');
                this.$repeatY.removeClass('active');
            } else if (_.last(bkgState.repeat) === 'repeat' || _.first(bkgState.repeat) === 'repeat-y') {
                this.$repeatX.removeClass('active');
                this.$repeatY.addClass('active');
            } else {
                this.$repeatX.removeClass('active');
                this.$repeatY.removeClass('active');
            }

            if(bkgState.attachment === 'fixed') {
                this.$attached.addClass('active');
            } else {
                this.$attached.removeClass('active');
            }

            if(bkgState.image === 'none') {
                this.$imgRemove.addClass('disabled');
            } else {
                this.$imgRemove.removeClass('disabled');
            }


        },
        setActive: function(active) {
        }
    });

    return BkgBar;
});