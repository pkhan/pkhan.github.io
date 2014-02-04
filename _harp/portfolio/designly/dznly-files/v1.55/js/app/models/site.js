
define([
    'app/wigbackbone', 
    'underscore',
    ], 
    function(Backbone, _) {
        var Site = Backbone.Model.extend({
            defaults: function() {
                return {
                    name: 'site-name',
                    domain: '',
                    stacks: [],
                    site_slides: []
                };
            },
            urlRoot: '/api/v1/sites/'
        });

        return Site;
});
