
define([
    'underscore',
    'backbone',
    'jquery',
    'app/collections/thumbcollection',
    'app/views/binview',
    'app/models/slide',
    'app/views/slidecontrols',
    'app/views/slideview',
    'app/views/templatepicker',
    'app/views/commandbar',
    'app/views/textbar',
    'app/wigevents',
    'app/collections/undoredo',
    'app/views/linkbar',
    'mine',
    'app/views/colorbar',
    'app/views/roundbar',
    'app/views/imagebar',
    'app/views/siteslideview',
    'app/views/componentlib',
    'app/views/bkgbar',
    'app/views/featherview'
    ], 
    function(_, Backbone, $, ThumbCollection, BinView, Slide, SlideControls, SlideView, TemplatePicker, CommandBar, TextBar, wigEvents, UndoRedo, LinkBar, slideToggles,
        ColorBar, RoundBar, ImageBar, SiteSlideView, ComponentLib, BkgBar, FeatherView) {
    var AppEditView = Backbone.View.extend({
        el: 'body',
        events: {
            'click .add-slide.btn' : 'addSlide',
            'click #restore-header .add-slide-controls button' : 'addHeader',
            'click #restore-footer .add-slide-controls button' : 'addFooter'
        },
        initialize: function() {
            this.binView = new BinView();
            // this.textBar = new TextBar();
            // this.commandBar.addBar(this.textBar);
            this.undoRedo = new UndoRedo(this);
            this.thumbs = this.binView.bin;
            this.templatePicker = new TemplatePicker();
            this.grid = false;
        },
        start: function(stack) {
            var appView = this;
            this.stack = stack;

            // this.stack.sc.forEach(function(slide) {
            //     slide.view = new SlideView({model: slide});
            // });

            var renderSlideImmediate = _.debounce(function() {
                appView.renderSlides();
            }, 100, true);

            var renderSlidesDB = _.debounce(function() {
                renderSlideImmediate();
            }, 100);

            this.listenTo(this.stack.sc, 'add', function(slide){
                slide.view = new SlideView({model: slide});
                slide.view.render();
                // appView.$slidesArea.find('.add-slide-container').before(slide.view.el);
                appView.setActiveSlide(slide.view);
                renderSlidesDB();
            });

            this.listenTo(this.stack.sc, 'remove', function(slide, sc) {
                var order = slide.get('order_index');
                order = order >= sc.length ? sc.length - 1 : order;
                appView.setActiveSlide(sc.at(order).view);
                slide.view.remove();
            });

            this.listenTo(this.stack.sc, 'render:now', function() {
                renderSlideImmediate();
            });

            // this.listenTo(this.stack.sc, 'reset', function() {

            // });

            this.listenTo(this.stack.siteSlides, 'remove', function(siteSlide) {
                siteSlide.view.remove();
                renderSlidesDB();
            });

            this.listenTo(this.stack.siteSlides, 'add', function(siteSlide) {
                siteSlide.view = new SiteSlideView({model:siteSlide});
                siteSlide.view.render();
                siteSlide.view.deactivate(true);
                renderSlidesDB();
            });

            // this.listenTo(this.stack.siteSlides, 'change:has_content', function(siteSlide, has_content) {
            //     var action = 'remove'
            //     if(has_content) {
            //         action = 'add';
            //     }
            //     stack.siteSlides.trigger(action, siteSlide);
            // });

            this.stack.sc.forEach(function(slide) {
                stack.sc.trigger('add', slide);
            });

            this.stack.siteSlides.forEach(function(siteSlide) {
                stack.siteSlides.trigger('add', siteSlide);
            });

            this.stack.sc.trigger('render:now');

            this.listenTo(this.stack.sc, 'activate:slide', function(activeSlide) {
                this.stack.sc.forEach(function(slide){
                    if(slide !== activeSlide){
                        slide.view.deactivate(false);
                    }
                });
                this.stack.siteSlides.forEach(function(slide) {
                    if(slide !== activeSlide){
                        slide.view.deactivate(true);
                    }
                });
                this.setActiveSlide(activeSlide.view);
            });

            this.listenTo(this.stack.siteSlides, 'activate:slide', function(activeSlide) {
                this.stack.sc.forEach(function(slide){
                    if(slide !== activeSlide){
                        slide.view.deactivate(true);
                    }
                });
                this.stack.siteSlides.forEach(function(slide) {
                    if(slide !== activeSlide){
                        slide.view.deactivate(false);
                    }
                });
                this.setActiveSlide(activeSlide.view);
            });

            // this.listenTo(wigEvents, 'activechange', function(active, slide) {
            //     if(active.length > 0) {
            //         this.setActiveSlide(slide.view);
            //     }
            // });

            wigEvents.trigger('changepoint', 'Initial State');
            wigEvents.trigger('appstart', this);
            // this.setActiveSlide(this.stack.sc.last().view);
        },
        renderSlides: function() {
            var frag = document.createDocumentFragment(),
            appView = this,
            header = this.stack.getSiteSlide('Header'),
            footer = this.stack.getSiteSlide('Footer');

            if(header) {
                frag.appendChild(header.view.el);
                this.$restoreHeader.hide();
            } else {
                if(window.site_json.global_slides) {
                    this.$restoreHeader.show();
                }
            }
            this.stack.sc.forEach(function(slide) {
                // slide.view.$el.appendTo(appView.$slidesArea);
                frag.appendChild(slide.view.el);
            });
            if(footer) {
                frag.appendChild(footer.view.el);   
                this.$restoreFooter.find('.add-slide-controls').hide();
            } else {
                if(window.site_json.global_slides) {
                    this.$restoreFooter.find('.add-slide-controls').show();
                }
            }
            try {
                appView.$restoreFooter.before(frag);
            } catch (e) {
                
            }
            slideToggles();
        },
        render: function() {
            var appView = this,
            frag = document.createDocumentFragment();
            this.$slidesArea = this.$('.slides-outer');
            this.$addSlide = this.$slidesArea.find('.add-slide-container');

            this.$restoreHeader = this.$('#restore-header');
            this.$restoreFooter = this.$('#restore-footer');

            this.$sideMenu = this.$('.side-menu');
            // this.listenTo(wigEvents, 'deadzone', function() {
            //     wigEvents.trigger('sidemenu:hide');
            // });
            var onOutsideClick = function(evt) {
                if(appView.$sideMenu.has(evt.target).length === 0 && !appView.$sideMenu.is(evt.target)) {
                    wigEvents.trigger('sidemenu:hide');
                }
            };
            this.listenTo(wigEvents, 'sidemenu:show', function() {
                this.$sideMenu.show();
                $(window).on('click', onOutsideClick);

            });
            this.listenTo(wigEvents, 'sidemenu:hide', function() {
                this.$sideMenu.hide();
                $(window).off('click', onOutsideClick);
            });

            this.componentLib = new ComponentLib();
            this.componentLib.render();

            this.slideControls = new SlideControls();
            this.slideControls.render();

            this.featherView = new FeatherView();
            this.featherView.render();

            this.commandBar = new CommandBar({el: $('.brick-bar')});
            this.commandBar.addBar(this.binView, true);
            this.textBar = new TextBar({el: $('.text-controls')[0]});
            this.textBar.render();
            this.commandBar.addBar(this.textBar);

            this.linkBar = new LinkBar();
            this.linkBar.render();
            this.commandBar.addBar(this.linkBar);

            this.colorBar = new ColorBar();
            this.colorBar.render();
            this.commandBar.addBar(this.colorBar);

            this.roundBar = new RoundBar();
            this.roundBar.render()
            this.commandBar.addBar(this.roundBar);

            this.imageBar = new ImageBar();
            this.imageBar.render();
            this.commandBar.addBar(this.imageBar);

            this.bkgBar = new BkgBar();
            this.bkgBar.render();
            this.commandBar.addBar(this.bkgBar);

            this.$('.brick-bar').append(this.commandBar.render().el);
            this.commandBar.domInserted();
            this.commandBar.showBars([]);

            this.listenTo(wigEvents, 'bkg:settings', function(slide) {
                this.bkgBar.setSlide(slide);
                this.commandBar.showNamedBar('background');
            });

            this.listenTo(wigEvents, 'placebrick', function(pbList, xToOffset, relative) {
                var destSlide = this.activeSlide;
                var overlap = this.activeSlide.viewPortMiddle();
                if(!overlap || !destSlide.model.collection) {
                    destSlide = this.stack.sc.find(function(slide) {
                        overlap = slide.view.viewPortMiddle();
                        return !!overlap;
                    }).view;
                }
                destSlide.model.bc.addAndOrder(pbList);
                _.each(pbList, function(pb, i) {
                    pb.updateBox();
                    if(i === 0) {
                        pb.view.activate(false);
                    }
                    else {
                        pb.view.activate(true);
                    }
                });
                if(xToOffset !== false) {
                    var x = xToOffset;
                    if(!relative) {
                        x = x - destSlide.$slideInt.getBox().left;
                    }
                    pbList[0].trigger('movegroup', pbList[0], {
                        x: x,
                        y: overlap.relativeTo(destSlide.$slideInt.getBox()).top
                    });
                }
            });

            this.templatePicker.hide();
            this.$el.append(this.templatePicker.el);

            slideToggles();

            return this;
        },
        addSlide: function(evt) {
            evt.stopPropagation();
            var stack = this.stack;
            // var slide = new Slide({ 
            //     name: 'New Slide',
            //     stack: this.stack.get('resource_uri')
            // });
            this.templatePicker.show();
            wigEvents.trigger('starttemplatepicker');
            this.templatePicker.once('picked', function(templateSlide) {
                if(!window.config.DEMO) {
                    stack.sc.create({
                        name: 'New Slide',
                        stack: stack.get('resource_uri'),
                        bricks: _.clone(templateSlide.get('bricks')),
                        height: templateSlide.get('height'),
                        slide_html: templateSlide.get('slide_html'),
                        slide_style: templateSlide.get('slide_style')
                    });
                } else {
                    stack.sc.add({
                        name: 'New Slide',
                        stack: stack.get('resource_uri'),
                        bricks: _.clone(templateSlide.get('bricks')),
                        height: templateSlide.get('height'),
                        slide_html: templateSlide.get('slide_html'),
                        slide_style: templateSlide.get('slide_style')
                    });
                }
                stack.sc.trigger('render:now');
                // stack.sc.add(slide);
                wigEvents.trigger('changepoint', 'Add Section');
                slideToggles();
            });
            
            // this.setActiveSlide(slide.view);
        },
        setActiveSlide: function(slideView) {
            // this.stack.sc.forEach(function(slide){
            //     if(slide.view) {
            //         slide.view.deactivate();
            //     }
            // });  
            if(slideView) {
                this.activeSlide = slideView;
            }
            //slideView.$slideInt[0].scrollIntoView();
        },
        addHeader: function() {
            this.addGlobal('Header');
        },
        addFooter: function() {
            this.addGlobal('Footer');
        },
        addGlobal: function(type) {
            var globalSlides = window.site_json.global_slides;
            var global = _.findWhere(globalSlides, {
                slide_type: type
            });
            if(global.bricks.length === 0) {
                global.bricks = [{"name":"Heading","thumb_html":"<i class=\"icon-font\"></i><h5>Heading</h5>","html":"<h1 style=\"font-family: 'Open Sans'; background-size: 446px 37px; height: 54px; width: 446px; background-position: 0px 0px;\">This is Your " + global.slide_type + "</h1>","category":"Text","description":"Brick Description","scaling":false,"css":{},"position":{"top":5,"left":0,"height":54,"width":446,"right":446,"bottom":59},"stackOrder":0,"style":"top: 5px; left: 0px; width: 446px; height: 54px; z-index: 0;","wrapper":"","slide":"/api/v1/slides/40/","bgXPos":0,"bgYPos":0,"bgW":549,"bgH":37},{"name":"Text","thumb_html":"<i class=\"icon-align-left\"></i><h5>Text</h5>","html":"<p style=\"display: inline-block; width: 525px; font-family: 'Open Sans'; background-size: 525px 69px; height: 99px; background-position: 0px 0px;\">Right now, it has no content. Don't worry, this message won't appear on your final page. Click " + (global.slide_type === 'Header' ? "up" : "down") + " here to start editing.<br><br>Once you add content to this section, it will appear on all of the pages on this site. You can control which pages have me from your other pages.<br></p>","category":"Text","description":"Brick Description","scaling":false,"css":{},"position":{"top":52,"left":4.5,"height":99,"width":525,"right":529.5,"bottom":151},"stackOrder":1,"style":"top: 52px; left: 4.5px; width: 525px; height: 99px; z-index: 1;","wrapper":"","slide":"/api/v1/slides/40/","bgXPos":0,"bgYPos":0,"bgW":468,"bgH":69}];
                global.height = 170;
                global.has_content = false;
            } else {
                global.has_content = true;
            }
            this.stack.siteSlides.add(global);
        }
    });

    return AppEditView;
});