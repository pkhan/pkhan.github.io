//this file contains all the callbacks, script loading, and bootstrapping for wizzywig
var _wig = {};
(function(_wig) {
var $, 
config =
{
    ww_app: '',
    ww_cdn: 'ww-static',
    static_url: '/',
    edit_url: '/edit',
    try_url: '/try',
    ping_url: '/ping',
    access_code: 0,
    save_url: '/save/'
};

config.base_url = config.ww_cdn;
config.iframe = !(window.parent === window);

_wig.config = config;

_wig.bodyVis = (function() {
    var style = document.createElement('style'),
    head = document.getElementsByTagName('head')[0],
    style_text = 'body { visibility: hidden !important;}';
    style.id = 'wig-hide';
    style.type = 'text/css';
    try {
        style.innerHTML = style_text;
    } catch (err) { //IE7 fix
        style.styleSheet.cssText = style_text;
    }
    
    return {
        style: style,
        head: head,
        hide: function() {
            this.head.appendChild(this.style);
        },
        show: function() {
            this.head.removeChild(this.style);
        }
    };
})();

_wig.Callbacks = (function Callbacks(){
    var topics = ['jqueryLoaded', 'curlLoaded', 'hasAccess', 'editMode', 'scriptsLoaded', 'changesApplied', 'badgeInserted', 'domReady'],
    callbacks = {},
    i,
    len = topics.length;
    for(i = 0; i < len; i++) {
        callbacks[topics[i]] = {
            fired: false,
            actions: []
        }
    }
    return {
        topics: topics,
        callbacks: callbacks,
        subscribe: function(topic, func, ctx) {
            var topic_callbacks = this.callbacks[topic];
            ctx = ctx || _wig;
            if(topic_callbacks.fired) {
                func.call(ctx);
            } else {
                topic_callbacks.actions.push({
                    func: func,
                    ctx: ctx
                });
            }
        },
        unsubscribe: function(topic, func) {
            var topic_callbacks = this.callbacks[topic],
            i,
            len = topic_callbacks.actions.length,
            new_actions = [];
            if(typeof func !== 'undefined') {
                for(i = 0; i < len; i++) {
                    if(topic_callbacks.actions[i].func !== func) {
                        new_actions.push(topic_callbacks.actions[i]);
                    }
                }
            }
            topic_callbacks.actions = new_actions;
        },
        unsubscribeAll: function() {
            var topic;
            for(topic in this.callbacks) {
                this.callbacks[topic].actions = [];
            }
        },
        fire: function(topic, args){
            var topic_callbacks = this.callbacks[topic],
            i,
            len = topic_callbacks.actions.length;
            if(!topic_callbacks.fired) {
                topic_callbacks.fired = true;
                for(i = 0; i < len; i++){
                    topic_callbacks.actions[i].func.call(topic_callbacks.actions[i].ctx, args);
                }
                topic_callbacks.actions = [];
            }
        },
        checkFired: function(topic) {
            return this.callbacks[topic].fired;
        },
        checkAll: function() {
            var topic, i, len = arguments.length;
            for(i = 0; i < len; i++) {
                topic = arguments[i];
                if(!this.callbacks[topic].fired) {
                    return false;
                }
            }
            return true;
        },
        add: function(topic) {
            callbacks[topic] = {
                fired: false,
                actions: []
            }
        }
    };
})();

//Script and style loaders

_wig.getScript = function(url, success) {
    //load a javascript file (also works with compiled templates)
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    this.addHeadTag(script, success, true);
};

_wig.getStyle = function(url, success) {
    //load a CSS stylesheet onto the page
    var style = document.createElement('link');
    style.type = 'text/css';
    style.rel = 'stylesheet';
    style.href = url;
    this.addHeadTag(style, success, false);
};

_wig.addHeadTag = function(elem, success, remove_on_complete) {
    //add any tag to the head, callback when it loads
    var head = document.getElementsByTagName('head')[0],
    done = false;
    success = success || function() {};
    // Attach handlers for all browsers
    elem.onload = elem.onreadystatechange = function(){
        if ( !done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete') ) {
            done = true;
            success();
            elem.onload = elem.onreadystatechange = null;
            if(remove_on_complete) {
                head.removeChild(elem);
            }
        }
    };
    head.appendChild(elem);
};

//state checkers
_wig.checkAccess = function() {
    _wig.Callbacks.fire('hasAccess');
    // var url = config.ww_app + config.ping_url + '/';
    // _wig.Callbacks.subscribe('domReady', function() {
    //     $.ajax(url, {
    //         dataType: 'jsonp',
    //         success: function(data) {
    //             if($.inArray(config.access_code, data.domains) >= 0 && data.logged_in) {
    //                 _wig.Callbacks.fire('hasAccess');
    //             } 
    //         }
    //     });
    // });
};

_wig.checkEdit = function() {
    _wig.Callbacks.fire('editMode');
    // var search = window.location.search.replace('?','').replace(/\?/g,'&').split('&'),
    // i, pair, wig_edit = false;

    // for(i = 0; i < search.length; i++) {
    //     pair = search[i].split('=');
    //     if(pair[0] === 'wigEdit' && pair[1] === 'true') {
    //         wig_edit = true;
    //         break;
    //     }
    // }

    // if(wig_edit) {
    //     _wig.Callbacks.fire('editMode');
    // }

    // var url = window.document.referrer;
    // if(config.iframe) {
    //     if(url.match(config.ww_app + config.edit_url) || url.match(config.ww_app + config.try_url)) {
    //         _wig.Callbacks.fire('editMode');
    //     }
    // }
};

//curl kickoff
_wig.loadCurl = function() {
    _wig.getScript(config.ww_cdn + '/lib/curl.js', function() {
        window.curl.config({
            apiContext: _wig,
            defineContext: _wig,
            baseUrl: config.ww_cdn,
            paths: {
                // jquery: 'lib/jquery',
                underscore: 'lib/underscore',
                backbone: 'lib/backbone',
                jqhotkeys: 'lib/jquery.hotkeys',
                wysiwyg: 'lib/bootstrap-wysiwyg',
                jst : 'templates-built',
                bootstrap: 'lib/bootstrap'
            }
        });
        _wig.define('jquery', [], function() { return $ });
        _wig.define('callbacks', [], _wig.Callbacks);
        _wig.define('_wig', [], _wig);
        _wig.define('config', [], config);
        _wig.Callbacks.fire('curlLoaded');
    });
};

_wig.bodyVis.hide();

_wig.Callbacks.subscribe('changesApplied', function() {
    _wig.bodyVis.show();
});

//load jquery
_wig.getScript('//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js', function() {
// _wig.getScript(_wig.config.ww_cdn + '/lib/jquery-1.9.1.min.js', function() {
    $ = window.$.noConflict(true);
    _wig.$ = $;
    _wig.Callbacks.fire('jqueryLoaded');
    $(window.document).ready(function() {
        _wig.Callbacks.fire('domReady');
    });
});

//set up callback functions
_wig.Callbacks.subscribe('domReady', function() {
    //Place all the necessary changes in here
    // parse out url bits
    var href = window.location.href, //http://app.chartio.com/about/?urlvar=1
    hostname = window.location.hostname, //app.chartio.com
    host = window.location.host, //app.chartio.com  [for site with a port, this is like localhost:8000]
    pathname = window.location.pathname, // /about/
    urlvars = window.location.search, // ?urlvar=1
    host_split = hostname.split('.'), //['app','chartio','com']
    split_len = host_split.length, // 3
    domain = host_split.slice(split_len - 2, split_len).join('.'), //'chartio.com'
    subdomain = host_split.slice(0, split_len - 2).join('.'); //'app'

    subdomain = subdomain === 'www' ? '' : subdomain;

    _wig.Callbacks.fire('changesApplied');
});

_wig.Callbacks.subscribe('jqueryLoaded', function() {
    _wig.checkAccess();
});

_wig.Callbacks.subscribe('hasAccess', function() {
    _wig.checkEdit();
    _wig.loadCurl();
});

_wig.Callbacks.subscribe('curlLoaded', function() {
    _wig.curl(['app/core'])//, 'domReady!'])
    .then(function(core) {
        $('body').append(core.wigUI.el);
        _wig.Callbacks.subscribe('editMode', function() {
            _wig.curl(['app/edit', 'app/resize', 'app/components'])
            .then(function(edit, resize, sushi) {
                edit.startEdit();
                sushi.start();
            });
        });
    });
});


})(_wig);
