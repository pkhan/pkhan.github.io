
requirejs.config({
	paths: {
		jquery: 'lib/jquery',
		jqhotkeys: 'lib/jquery.hotkeys',
		jqbox: 'lib/jquery.box',
        jqfittext: 'lib/jquery.fittext',
        mine: 'lib/mine',
		underscore: 'lib/lodash.modern.min',
		backbone: 'lib/backbone',
		bootstrap: 'lib/bootstrap.min',
		colorpicker: 'lib/bootstrap-colorpicker',
		wysiwyg: 'lib/bootstrap-wysiwyg',
		tastypie: 'lib/backbone-tastypie',
		filepicker: '//api.filepicker.io/v1/filepicker',
		snaps: 'lib/snaps'
	},
	shim: {
		'jqhotkeys': ['jquery'],
		'jqbox': ['jquery'],
        'jqfittext' : ['jquery'],
        'mine' : ['jquery'],
		'bootstrap' : ['jquery'],
		'colorpicker' : ['jquery'],
		'wysiwyg' : ['jquery', 'jqhotkeys'],
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
		'tastypie' : ['backbone'],
		'filepicker' : {
			deps: [],
			exports: 'filepicker'
		},
		'snaps': ['jquery']
	}

}); 

require([
	'underscore',
	'backbone',
	'jquery',
	'app/views/textbar',
    'app/models/site',
    'bootstrap',
	'jqhotkeys',
    'jqfittext',
    'mine',
    'tastypie'
	], function(_, Backbone, $, TextBar, Site){

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

    Backbone.Tastypie.csrfToken = getCookie('csrftoken');

    var editSite = new Site(site_json);
    window.editSite = editSite;

});
