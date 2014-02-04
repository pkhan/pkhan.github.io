
define([
    'backbone', 
    'app/models/stack'
    ], 
    function(Backbone, Stack) {
    var StackCollection = Backbone.Collection.extend({
        model: Stack,
        url: '/api/v1/stacks/'
    });

    return StackCollection;
});