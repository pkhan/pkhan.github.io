
define([
    'backbone', 
    'underscore',
    'app/models/placedbrick',
    'app/wigevents'
    ], 
    function(Backbone, _, PlacedBrick, wigEvents) {
    var BrickCollection = Backbone.Collection.extend({
        model: PlacedBrick,
        initialize: function() {
            var bc = this;
            this.active = [];
            this.activeCount = 0;
            this.on('remove', function(pb) {
                var so = pb.get('stackOrder');
                _.each(
                    bc.filter(function(pb) {
                        if(pb.get('stackOrder') > so) {
                            return true;
                        }
                        return false;
                    }),
                function(pb) {
                    var oldSo = pb.get('stackOrder');
                    pb.set('stackOrder', oldSo - 1, {silent: true});
                    pb.trigger('change:stackOrder', pb, 'undoredo');
                });
            });

            this.acDB = function(active) {
                bc.trigger('activechange', active);
            };
            var acDB = this.acDB;

            this.on('activate', function(pb, multi) {
                if(!multi) {
                    this.deactivateAll();
                }
                if(_.indexOf(this.active, pb) === -1) {
                    this.active.push(pb);
                };
                this.activeCount = this.active.length;
                acDB(this.active);
                // wigEvents.trigger('activechange', this.active);
            });

            this.on('deactivate', function(pb) {
                this.active = _.reject(this.active, function(activePb){
                    return activePb === pb;
                });
                this.activeCount = this.active.length;
                acDB(this.active);
                // wigEvents.trigger('activechange', this.active);
            });

            this.on('remove', function(pb) {
                this.active = _.reject(this.active, function(activePb){
                    return activePb === pb;
                });
                this.activeCount = this.active.length;
                acDB(this.active);
                // wigEvents.trigger('activechange', this.active);
            });
        },
        getBoxes: function() {
            return this.map(function(pb) {
                var pos = pb.get('position');
                return {
                    pb: pb,
                    box: new Box(pos.top, pos.left, pos.height, pos.width)
                };
            });
        },
        updateAllBoxes: function() {
            this.forEach(function(pb) {
                pb.updateBox();
            });
        },
        getActive: function() {
            return this.active;
            // return this.filter(function(pb) { 
            //     return pb.view.active;
            // });
        },
        deactivateAll: function() {
            _.each(this.getActive(), function(pb) {
                pb.view.deactivate();
            });
            //OLD
            try { 
                appView.activeSlide.$slideInt.css('overflow', 'hidden');
            } catch(e) {

            }
            this.acDB([]);
            // this.trigger('activechange', []);
        },
        maxStack: function() {
            return this.max(function(pb){
                return pb.get('stackOrder');
            }).get('stackOrder');
        },
        addAndOrder: function(pb) {
            if(_.isArray(pb)) {
                this.addAndOrderAll(pb);
            } else {
                if(this.length > 0){
                    pb.set('stackOrder', this.maxStack() + 1);
                } else {
                    pb.set('stackOrder', 0);
                }
                this.add(pb);
            }
        },
        addAndOrderAll: function(pbList) {
            var bc = this;
            _.each(pbList, function(pb) {
                if(bc.length > 0){
                    pb.set('stackOrder', bc.maxStack() + 1);
                } else {
                    pb.set('stackOrder', 0);
                }
                bc.add(pb);
            });
        },
        activateSelected: function(selPos, addTo){
            addTo = addTo || [];
            //takes x y coordinates of boxes and sees if they overlap
            var overlaps = function(p1, p2){
                var x1 = p1.left,
                    y1 = p1.top,
                    x2 = p1.left + p1.width,
                    y2 = p1.top + p1.height, 
                    xx1 = p2.view.$el.offset().left, 
                    yy1 = p2.view.$el.offset().top, 
                    xx2 = p2.view.$el.offset().left + p2.get('position').width, 
                    yy2 = p2.view.$el.offset().top + p2.get('position').height;

                var over = ((x1 <= xx2) && (xx1 <= x2)) && ((y1 <= yy2) && (yy1 <= y2));
                return over;
            }

            this.forEach(function(pb) {
                if(overlaps(selPos, pb)){
                    pb.view.activate(true);
                    pb.view.activateControls();
                }
                else if (pb.view.active && _.indexOf(addTo, pb) === -1){
                    pb.view.deactivate();
                };
            });
        }
    });

    return BrickCollection;
});