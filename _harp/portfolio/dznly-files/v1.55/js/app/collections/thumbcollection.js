
define([
    'backbone', 
    'app/models/brick'
    ], 
    function(Backbone, Brick) {
    var ThumbCollection = Backbone.Collection.extend({
        model: Brick,
        getByCategory: function(category) {
            return this.where({category: category});
        }
    });

    return ThumbCollection;
});