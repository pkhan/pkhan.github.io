
define([
    'backbone',
    'app/models/stack',
    'app/appview'
    ], 
    function(Backbone, Stack, appView) {

    var editStack;

    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    
    var router = new (Backbone.Router.extend({
        routes: {
            '' : 'newStack',
            ':stack_id(/:slidenum)' : 'editStack'
        },
        newStack: function() {
            editStack = new Stack({
                name: 'new Stack',
                site: site_info
            });
            editStack.save({}, {
                beforeSend: function(xhr) { 
                    xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken')); 
                }});
            appView.start(editStack);
            editStack.sc.add({
                name: 'Slide 1'
            });
        },
        editStack: function(stackid, slidenum) {
            editStack = new Stack({id: stackid});
            editStack.fetch({
                success: function() {
                    appView.start(editStack);
                    editStack.sc.add(editStack.get('slides'));
                }
            });
        }
    }))();

    return router;
});