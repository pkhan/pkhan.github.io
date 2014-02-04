
define([
    'app/views/barview',
    'app/appview'
    ], 
    function(BarView) {
    var BinView = BarView.extend({
        tagName: 'div',
        className: 'slide-bin',
        barInit: function() {
            var bin = this.bin = new ThumbCollection();
            this.listenTo(bin, 'add', function(brick) {
                var thumb = new BrickThumb({model: brick});
                this.$el.append(thumb.render().el);
            });
        },
        render: function() {
            this.renderAll();
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