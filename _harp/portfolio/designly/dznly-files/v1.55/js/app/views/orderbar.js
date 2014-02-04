define([
	'underscore',
	'backbone',
	'app/views/barview',
	'app/wigevents'
	],
function(_, Backbone, BarView, wigEvents) {

	var OrderBar = BarView.extend({
		el: '.order-controls',
		events: {
			'click #up-layer' : 'moveToTop',
            'click #down-layer' : 'moveToBottom'
		},
		barInit: function() {

		},
        moveToTop: function(evt) {
            if(evt) {
                evt.preventDefault();
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
            var active = _.sortBy(this.active, function(pb) {
                return pb.get('stackOrder') * -1;
            }),
            min = 0,
            minBrick = _.last(active),
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
		render: function() {
			return this;
		}
	});

	return OrderBar;
});