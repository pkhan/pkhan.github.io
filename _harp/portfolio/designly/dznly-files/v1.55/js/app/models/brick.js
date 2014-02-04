
define(['app/wigbackbone'], function(Backbone) {
	var Brick = Backbone.Model.extend({
        defaults: {
            name: 'Brick',
            thumb_html: '<i></i>',
            html: '<div></div>',
            category: 'none',
            description: 'Brick Description',
            scaling: false,
            css: {}
        }
    });
    return Brick;
});