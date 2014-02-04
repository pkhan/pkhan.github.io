
define([
    'underscore',
    'backbone', 
    'app/models/slide'
    ], 
    function(_, Backbone, Slide) {

    var SlideCollection = Backbone.Collection.extend({
        model: Slide,
        url: '/api/v1/slides/',
        comparator: 'order_index',
        initialize: function() {
            var sc = this;

            this.on('remove', function(slide){
                var slidesBelow = sc.filter(function(otherSlide){
                    if(otherSlide.get('order_index') < slide.get('order_index')) {
                        return false;
                    }
                    return true;
                });

                _.each(slidesBelow, function(otherSlide) {
                    otherSlide.set('order_index', otherSlide.get('order_index') - 1);
                });
            });

            this.on('add:between', function() {
                sc.forEach(function(slide, index) {
                    slide.set('order_index', index, {silent:true});
                });
            });

            this.on('change:order_index', function(slide, newOrder) {
                var oldOrder = slide.previous('order_index');
                var oldSlides = sc.filter(function(otherSlide) {
                    if(otherSlide === slide) {
                        return false;
                    }
                    if(otherSlide.get('order_index') === newOrder) {
                        return true;
                    }
                    return false;
                });
                if(oldSlides.length > 0) {
                    oldSlides[0].set('order_index', oldOrder, { silent: true });
                }
                sc.sort();
            });

            this.on('sort', function() {
                var sc = this,
                max = sc.maxOrderIndex();
                sc.forEach(function(slide, index){
                    var enableString = 'UD';
                    if(index === 0) {
                        enableString = 'D';
                    }
                    if(index === max) {
                        enableString = 'U';
                    }
                    slide.trigger('updownenable', enableString);
                });
            });
        },
        add: function() {
            Backbone.Collection.prototype.add.apply(this, arguments);
            if(!arguments[1]) {
                return;
            }
            if(_.isUndefined(arguments[1].at)) {
                return;
            }
            this.trigger('add:between');
        },
        maxOrderIndex: function() {
            return _.max(this.pluck('order_index'));
        }
    });

    return SlideCollection;
});