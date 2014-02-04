
define([
    'backbone',
    'app/views/brickfull'
    ], 
    function(Backbone, BrickFull) {
    var BrickPreview = BrickFull.extend({
        placed: false,
        render: function() {
            this.$el.append(this.model.get('html')).hide();
            this.$el.css({
                'font-family' : 'Open Sans'
            });
            this.$el.find('*').css({
                'font-family': 'Open Sans'
            });
            return this;
        }
    });
    return BrickPreview;
});