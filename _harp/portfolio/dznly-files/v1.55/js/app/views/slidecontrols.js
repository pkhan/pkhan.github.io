
define([
    'underscore',
    'backbone',
    'jquery',
    'app/models/placedbrick',
    'app/wigevents'
    ], 
    function(_, Backbone, $, PlacedBrick, wigEvents) {
    var appView;

    var SlideControls = Backbone.View.extend({
        el: '.top-controls-container',
        events: {
            'click #delete-selected': 'delete',
            'click #cut-selected': 'brickCut',
            'click #copy-selected': 'brickCopy',
            'click #paste-selected': 'brickPaste',
            'click #up-layer' : 'moveToTop',
            'click #down-layer' : 'moveToBottom',
            'click #preview': 'togglePreview',
            'click #stack-publish': 'publish',
            'click #save-button' : 'save',
            'click #revert-all' : 'revert',
            'click #undo' : function() { 
                appView.undoRedo.undo();
            },
            'click #redo' : function() {
                appView.undoRedo.redo();
            },
            'click #grid-toggle' : 'toggleGrid'
        },
        initialize: function() {
            this.active = [];
            this.listenTo(wigEvents, 'activechange', function(active){
                this.active = active;
                this.updateControls(active.length > 0);
            });
            this.changed = false;
            this.listenToOnce(wigEvents, 'appstart', function(av) {
                appView = av;
                this.listenTo(wigEvents, 'changepoint undo redo', function() {
                    this.changed = true;
                });
            });
        },
        render: function() {
            var slideControls = this;
            // appView = require('app/appview');
            this.$activeControls = $('#up-layer,#down-layer,#delete-selected,#copy-selected,#cut-selected,#change-color').addClass('inactive');
            $('#paste-selected').addClass('inactive');
            this.$urControls = $('#undo,#redo').addClass('inactive');

            this.$clipboardDropdown = $('.clipboard-controls .dropdown-toggle');

            this.listenTo(wigEvents, 'rightclick', function(pb) {
                _.delay(function() {
                    slideControls.$clipboardDropdown
                    .parent()
                    .addClass('open');
                }, 100);
            });

            // this.listenTo(wigEvents, 'activechange', function(active) {
            //     if(active.length > 0) {
            //         slideControls.$activeControls.removeClass('inactive');
            //     } else {
            //         slideControls.$activeControls.addClass('inactive');
            //     }
            // });

            this.listenTo(wigEvents, 'urenable', function(urString, undoText, redoText) {
                this.$urControls.addClass('inactive');
                var $undo = this.$urControls.first();
                var $redo = this.$urControls.last();
                if(urString.match(/U/)) {
                    $undo.removeClass('inactive')
                    .attr('data-original-title', 'Undo ' + undoText)
                    .tooltip('fixTitle');
                    if($undo.next().is('.tooltip')) {
                        $undo.tooltip('show');    
                    }
                } else {
                    $undo.tooltip('hide');
                }
                if(urString.match(/R/)) {
                    $redo.removeClass('inactive')
                    .attr('data-original-title', 'Redo ' + redoText)
                    .tooltip('fixTitle');
                    if($redo.next().is('.tooltip')) {
                        $redo.tooltip('show');
                    }
                } else {
                    $redo.tooltip('hide');
                }
            });
            
            this.$save = this.$('#save-button');
            this.$saveTxt = this.$save.find('span');

            this.listenToOnce(wigEvents, 'appstart', function() {

                this.listenTo(wigEvents, 'savestart', function() {
                    this.$saveTxt.text('Saving...');
                });

                this.listenTo(wigEvents, 'changepoint undo redo', function() {
                    this.$saveTxt.text('Saved a few seconds ago');
                });

                this.listenTo(wigEvents, 'savecomplete', function() {
                    this.$save.removeClass('problem');
                    this.$saveTxt.text('All changes saved');
                    this.changed = false;
                });

                this.listenTo(wigEvents, 'savefail', function() {
                    this.$save.addClass('problem');
                    this.$saveTxt.text('Save error, click to retry');
                });

            });

            this.$saveModal = $('#pagenav-modal');
            this.$saveModal.modal({
                show: false
            });

            var afterSave = function() {
                slideControls.$saveModal.find('.pagenav-proceed')
                .removeClass('btn-danger')
                .addClass('btn-primary')
                .text('Proceed');
                slideControls.$saveModal.find('.pagenav-save').hide();
                slideControls.$saveModal.find('.status-text')
                .text('Save was successful. Click proceed to carry on.')
                .removeClass('problem');

                // window.location = slideControls.$saveModal.find('.pagenav-proceed').attr('href');
            };

            var afterSaveError = function() {
                slideControls.$saveModal.find('.pagenav-save').show();
                slideControls.$saveModal.find('.status-text').text('Whoops, there was an error while saving. Make sure you\'re connected to the Internet then try again.')
                .addClass('problem');
            };

            this.$aTags = this.$('a').not('[href=#],[href="javascript:void(0)"]').not('[target=_blank]');

            this.$saveModal.on('hide', function() {
                if(slideControls.changed) {
                    wigEvents.trigger('setnavalert');
                }
                slideControls.stopListening(wigEvents, 'savecomplete', afterSave);
                slideControls.stopListening(wigEvents, 'savefail', afterSaveError);

            });

            var pageNavHandler = function(evt) {
                if(!slideControls.changed) {
                    return true;
                } else {
                    evt.preventDefault();
                    slideControls.$saveModal.modal('show');
                    slideControls.$saveModal.find('.pagenav-save').hide();
                    slideControls.$saveModal.find('.pagenav-proceed')
                    .attr('href', $(this).attr('href'))
                    .removeClass('btn-primary')
                    .addClass('btn-danger');

                    slideControls.$saveModal.find('.status-text').html('&nbsp;');
                }
            };

            slideControls.$saveModal.find('.pagenav-save').on('click', function() {
                slideControls.$saveModal.find('.status-text').html('&nbsp;');
                slideControls.save();
            });

            if(!window.config.DEMO) {
                slideControls.$aTags.on('click', pageNavHandler);
            }
            slideControls.$saveModal.on('shown', function() {
                slideControls.listenTo(wigEvents, 'savecomplete', afterSave);
                slideControls.listenTo(wigEvents, 'savefail', afterSaveError);
                slideControls.save();
                wigEvents.trigger('killnavalert');
            });

            //publish stuff

            this.$publishModal = $('#publish-modal').modal({
                show: false
            });

            this.pubAfterSave = function() {
                var task_id = appView.stack.get('task_id');
                slideControls.checkPublished(task_id);
            };

            this.pubAfterFail = function() {
                this.$publishModal.find('.publish-spin-wrap').removeClass('do-spin')
                .removeClass('done')
                .addClass('problem');
                this.$publishModal.find('.publish-done').css({
                    'visibility': 'visible'
                }).text('Publish error! Make sure you are connected to the Internet and please try again.');
                this.$publishModal.find('.publish-nav').css({
                    'visibility': 'hidden'
                });
                slideControls.cleanupPublished();
            };

            this.$publishModal.find('.publish-nav').attr('href', window.page_live_url).attr('target', '_blank');

            this.listenTo(wigEvents, 'publish:complete', function() {
                this.$publishModal.find('.publish-spin-wrap').removeClass('do-spin')
                .removeClass('problem')
                .addClass('done');
                this.$publishModal.find('.publish-done').css({
                    'visibility': 'visible'
                }).text('All Done!');
                this.$publishModal.find('.publish-nav').css({
                    'visibility': 'visible'
                });
                this.cleanupPublished();
            });

            this.listenTo(wigEvents, 'publish:fail', this.pubAfterFail);

            return this;
        },
        updateControls: function(isActive) {
            if(isActive) {
                this.$activeControls.removeClass('inactive');
            } else {
                this.$activeControls.addClass('inactive');
            }
        },
        getBC: function() {
            return appView.activeSlide.model.bc;
        },
        moveToTop: function(evt) {
            if(evt) {
                evt.preventDefault();
            }
            if(this.active.length === 0) {
                return;
            }
            var active = _.sortBy(this.active, function(pb) {
                return pb.get('stackOrder') * -1;
            }),
            max = this.active[0].collection.maxStack(),
            maxBrick = _.first(active),
            maxBrickSo = maxBrick.get('stackOrder'),
            diff = max - maxBrickSo;

            if(diff === 0) {
                return false;
            }

            _.each(active, function(pb) {
                var so = pb.get('stackOrder'),
                newSo = so + diff,
                betweens;
                betweens = active[0].collection.filter(function(pb) {
                    var mySo = pb.get('stackOrder');
                    if(_.indexOf(active, pb) === -1) {
                        return (so < mySo) && (mySo <= newSo);
                    }
                    return false;
                });

                _.each(betweens, function(pb) {
                    var mySo = pb.get('stackOrder');
                    pb.set('stackOrder', mySo - 1);
                });
                pb.set('stackOrder', newSo);
            });
            wigEvents.trigger('changepoint', 'Move to Top');

        },
        moveToBottom: function(evt) {
            if(evt) {
                evt.preventDefault();
            }
            if(this.active.length === 0) {
                return;
            }
            var active = _.sortBy(this.active, function(pb) {
                return pb.get('stackOrder');
            }),
            min = 0,
            minBrick = _.first(active),
            minBrickSo = minBrick.get('stackOrder'),
            diff = min - minBrickSo;

            if(diff === 0) {
                return false;
            }

            _.each(active, function(pb) {
                var so = pb.get('stackOrder'),
                newSo = so + diff,
                betweens;
                betweens = active[0].collection.filter(function(pb) {
                    var mySo = pb.get('stackOrder');
                    if(_.indexOf(active, pb) === -1) {
                        return (mySo < so) && (mySo >= newSo);
                    }
                    return false;
                });

                _.each(betweens, function(pb) {
                    var mySo = pb.get('stackOrder');
                    pb.set('stackOrder', mySo + 1);
                });
                pb.set('stackOrder', newSo);
            });

            wigEvents.trigger('changepoint', 'Move to Bottom');
        },
        moveUp: function(evt) {
            var active = _.sortBy(this.getBC().getActive(), function(pb) {
                return pb.get('stackOrder') * -1;
            }),
            max = this.getBC().maxStack(),
            atMax = false,
            modal = this;
            if(evt) {
                evt.preventDefault();
            }
            if(this.active.length === 0) {
                return;
            }
            //are any of the active bricks already at the top?
            atMax = _.some(active, function(pb) {
                if(pb.get('stackOrder') === max) {
                    return true;
                }
                return false;
            });

            if(atMax) {
                return false;
            }

            _.each(active, function(pb) {
                var so = pb.get('stackOrder'),
                newSo = so + 1;
                modal.getBC().findWhere({stackOrder: newSo})
                .set('stackOrder', so);
                pb.set('stackOrder', newSo);
            });

            wigEvents.trigger('changepoint', 'Move Up');
        },
        moveDown: function(evt) {
            var active = _.sortBy(this.getBC().getActive(), function(pb) {
                return pb.get('stackOrder');
            }),
            min = 0,
            atMin = false,
            modal = this;
            if(evt) {
                evt.preventDefault();
            }
            if(this.active.length === 0) {
                return;
            }
            //are any of the active bricks already at the bottom?
            atMin = _.some(active, function(pb) {
                if(pb.get('stackOrder') === min) {
                    return true;
                }
                return false;
            });

            if(atMin) {
                return false;
            }

            _.each(active, function(pb) {
                var so = pb.get('stackOrder'),
                newSo = so - 1;
                modal.getBC().findWhere({stackOrder: newSo})
                .set('stackOrder', so);
                pb.set('stackOrder', newSo);
            });
            wigEvents.trigger('changepoint', 'Move Down');
        },
        toggleGrid: function(){
            appView.grid = !appView.grid;
            if(appView.grid){
                $('.slide-int').addClass('grid');
                wigEvents.trigger('grid:on');
            }else{
                $('.slide-int').removeClass('grid');
                wigEvents.trigger('grid:off');
            }
        },
        brickCut: function(evt) {
            if(evt) { 
                evt.preventDefault();
            }
            if(this.active.length === 0) {
                return;
            }
            this.brickCopy();
            this.delete();
        },
        brickCopy: function(evt) {
            if(evt) {
                evt.preventDefault();
            }
            if(this.active.length === 0) {
                return;
            }
            var clipboard = this.clipboard = [],
            $active = $();
            _.each(this.active, function(pb){
                clipboard.push(new PlacedBrick(pb.attributes));
                $active = $active.add(pb.view.$el);
            });
            this.$copyEls = $active;
            this.copyBox = $active.getBox();
            this.$('#paste-selected').removeClass('inactive');
        },
        brickPaste: function (evt) {
            var clipboard = this.clipboard ? this.clipboard : [],
            placedBrick,
            brickCollection = appView.activeSlide.model.bc,
            xTo = 0;
            if(evt) {
                evt.preventDefault();
            }
            if(clipboard.length > 0) {
                brickCollection.updateAllBoxes();
                brickCollection.deactivateAll();
                var vpBox = {
                    //145 represents the height of the fixed pos elements at the top of the screen
                    top: window.scrollY + 145,
                    left: window.scrollX ,
                    bottom: window.scrollY + window.innerHeight,
                    right: window.scrollX + window.innerWidth
                };
                if(this.copyBox.overlap(vpBox)) {
                    xTo = false;
                } else {
                    xTo = this.copyBox.left
                }
                wigEvents.trigger('placebrick', _.map(clipboard, function(pb) {
                    var newPb = new PlacedBrick(pb.attributes),
                    pos = newPb.get('position');
                    newPb.set('position', {
                        top: pos.top + 20,
                        left: pos.left + 20
                    });
                    return (newPb);
                }), xTo);

                wigEvents.trigger('changepoint', 'Paste');
            }
        },
        delete: function(evt) {
            var active = this.active;
            if(evt) {
                evt.preventDefault();
            }
            if(this.active.length > 0) {
                var toDelete = $();
                _.each(active, function(pb){
                    toDelete = toDelete.add(pb.view.el);
                });
                if(!toDelete.inViewPort({top: 145})) {
                    window.scrollTo(0, toDelete.getBox().top - 175);
                    _.each(active, function(pb, i) {
                        pb.view.$el.fadeOut(function() {
                            pb.collection.remove(pb);
                            if(i === active.length - 1) {
                                wigEvents.trigger('changepoint', 'Delete');
                            }
                        });
                    });
                }
                else {
                    _.each(this.active, function(pb){
                        pb.collection.remove(pb);
                    });
                    wigEvents.trigger('changepoint', 'Delete');
                }
            }
        },
        togglePreview: function(evt) {
            if(evt) {
                evt.preventDefault();
            }
            if($('.preview-hide').length > 0) {
                $('*').removeClass('preview-hide');
                $('.page-container').removeClass('published');
                $('#preview>p').text('Preview');
                $('.top-controls-container').removeClass('preview-mode');
            } else {
                var $slides = $('.slide-int').parents().add('.slide,.slide-int,.slide-int *,.top-controls-container,.top-controls-container *,.modal,.modal *');
                $('#preview>p').text('End Preview');
                $('*').not($slides).addClass('preview-hide');
                $('.page-container').addClass('published');
                $('.top-controls-container').addClass('preview-mode');
            }
        },
        save: function(publish) {
            // $('[contenteditable=true]').removeAttr('contenteditable');
            if(!window.config.DEMO) {
                if(this.changed || publish) {
                    appView.stack.save();
                }
            }
        },
        publish: function() {
            var slideControls = this;

            this.cleanupPublished();

            this.$publishModal.find('.publish-spin-wrap').removeClass('done')
            .removeClass('problem')
            .addClass('do-spin');
            this.$publishModal.find('.publish-done').css({
                'visibility': 'hidden'
            });
            this.$publishModal.find('.publish-nav').css({
                'visibility': 'hidden'
            });

            this.$publishModal.modal('show');

            appView.stack.set('publish', true);

            this.listenToOnce(wigEvents, 'savecomplete', this.pubAfterSave);
            this.listenToOnce(wigEvents, 'savefail', this.pubAfterFail);
            appView.stack.save(true);
            appView.stack.set('publish', false);
        },
        checkPublished: function(task_id) {
            task_id = task_id || 'null';
            var url = '/api/v1/tasks/' + task_id + '/';
            var interval = 2000; // in ms
            var timeout = 30000;
            var startTime = new Date();
            var stop = false;

            var poll = function() {
                $.ajax({
                    url: url,
                    method: 'GET'
                })
                .done(function(data) {
                    var status = data.status;
                    if(status === 'SUCCESS') {
                        stop = true;
                        _.delay(function() {
                            wigEvents.trigger('publish:complete');
                        }, 2000)
                    } else if (status === 'FAILURE') {
                        stop = true;
                            wigEvents.trigger('publish:fail');
                    }
                })
                .always(function() {
                    var nowTime = new Date();
                    var diff = nowTime - startTime;
                    if(!stop && diff <= timeout) {
                        _.delay(poll, interval);
                    } else if(diff > timeout) {
                        wigEvents.trigger('publish:fail');
                    }
                });
            };
            poll();

        },
        cleanupPublished: function() {
            this.stopListening(wigEvents, 'savecomplete', this.pubAfterSave);
            this.stopListening(wigEvents, 'savefail', this.pubAfterFail);
        },
        revert: function() {
            appView.stack.set(window.stack_json);
            appView.stack.trigger('childupdate');
            wigEvents.trigger('changepoint', 'Revert All Changes');
        }
    });

    return SlideControls;
});