
define([
    'underscore',
    'jquery',
    'app/views/barview', 
    'app/views/brickthumb',
    'app/collections/thumbcollection',
    'app/wigevents'
    ], 
    function(_, $, BarView, BrickThumb, ThumbCollection, wigEvents) {
    var BinView = BarView.extend({
        tagName: 'div',
        className: 'slide-bin',
        events: {
            'click .open-lib' : function(evt) {
                evt.stopPropagation();
                wigEvents.trigger('sidemenu:show');
                wigEvents.trigger('sidemenu:componentlib');
            }
        },
        barInit: function() {
            var bin = this.bin = new ThumbCollection();
            this.listenTo(bin, 'add', function(brick) {
                var thumb = new BrickThumb({model: brick});
                this.$openLib.before(thumb.render().el);
            });

            this.listenTo(wigEvents, 'stylechange', function(match, rules) {
                //rules of course being a valid css object for JQ's css function
                var matches,
                bin = this.bin;
                if(_.isArray(match)) {
                    //if category is an array, it's actually an array of strings of the names of the bricks
                    matches = [];
                    _.each(match, function(name) {
                        matches.push(bin.findWhere({name: name}));
                    });
                } else {
                    matches = bin.where({category: match});
                }
                _.each(matches, function(brick) {
                    var $el = $(brick.get('html'));
                    $el.css(rules);
                    brick.set('html', $el[0].outerHTML);
                });
            });
        },
        render: function() {
            this.renderAll();
            this.$openLib = $('<button class="brick-thumb btn btn-single open-lib"><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="20px" height="20px" viewbox="0 0 48 48" enable-background="new 0 0 16 16" xml:space="preserve" fill="#000000" class="svg replaced-svg"> <path d="M 39.00,48.00L9.00,48.00 c-4.971,0.00-9.00-4.032-9.00-9.00L0.00,9.00 c0.00-4.971, 4.029-9.00, 9.00-9.00l30.00,0.00 c 4.971,0.00, 9.00,4.029, 9.00,9.00l0.00,30.00 C 48.00,43.968, 43.971,48.00, 39.00,48.00z M 42.00,9.00c0.00-1.656-1.341-3.00-3.00-3.00L9.00,6.00 C 7.344,6.00, 6.00,7.344, 6.00,9.00l0.00,30.00 c0.00,1.659, 1.344,3.00, 3.00,3.00l30.00,0.00 c 1.659,0.00, 3.00-1.341, 3.00-3.00L42.00,9.00 z M 27.00,27.00l9.00,0.00 l0.00,9.00 L27.00,36.00 L27.00,27.00 z M 30.00,33.00l3.00,0.00 l0.00,-3.00 l-3.00,0.00 L30.00,33.00 z M 27.00,12.00l9.00,0.00 l0.00,9.00 L27.00,21.00 L27.00,12.00 z M 30.00,18.00l3.00,0.00 L33.00,15.00 l-3.00,0.00 L30.00,18.00 z M 12.00,27.00l9.00,0.00 l0.00,9.00 L12.00,36.00 L12.00,27.00 z M 15.00,33.00l3.00,0.00 l0.00,-3.00 L15.00,30.00 L15.00,33.00 z M 12.00,12.00l9.00,0.00 l0.00,9.00 L12.00,21.00 L12.00,12.00 z M 15.00,18.00l3.00,0.00 L18.00,15.00 L15.00,15.00 L15.00,18.00 z"></path></svg><h5>More</h5></button>').appendTo(this.el);
            return this;
        },
        renderAll: function() {
            var binView = this;
            this.bin.forEach(function(brickModel){
                var thumb = new BrickThumb({model: brickModel});
                binView.$el.append(thumb.render().el);
            });
            return this;
        }
    });

    return BinView;
});