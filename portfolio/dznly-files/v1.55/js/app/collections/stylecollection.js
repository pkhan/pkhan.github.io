define([
    'underscore',
    'backbone',
    'jquery',
    'app/models/stylegroup'
],
function(_, Backbone, $, StyleGroup) {

    var StyleCollection = Backbone.Collection.extend({
        model: StyleGroup,
        initialize: function() {
            this.query = '';
            this.nextID = 0;
            this.selPrefix = '#el';
            this.on('add', function(sg) {
                var sel = sg.get('selector');
                if(sel === '') {
                    sg.set('selector', this.selPrefix + this.nextID);
                    this.nextID++;
                }
            });
        },
        print: function() {
            var queryObj = {};
            this.forEach(function(sg) {
                var sel = sg.get('selector');
                sg.props.forEach(function(sp) {
                    var q = sp.get('query');
                    if(!queryObj[q]) {
                        queryObj[q] = {};
                    }
                    if(!queryObj[q][sel]) {
                        queryObj[q][sel] = '';
                    }
                    queryObj[q][sel] += sp.print();
                });
            });

            //ugh time to print
            var output = '';
            _.forEach(queryObj[''], function(selText, sel) {
                output += sel + '{' + selText + '}';
            });
            _.forEach(queryObj, function(qObj, query) {
                if(query !== '') {
                    output += query + '{';
                    _.forEach(qObj, function(selText, sel) {
                        output += sel + '{' + selText + '}';
                    });
                    output += '}';
                }
            });
            return output;
        },
        setQuery: function(queryText) {
            this.forEach(function(sg) {
                sg.fetchStyle();
                sg.setQuery(queryText);
                sg.replaceStyle();
            });
        },
        fetchStyles: function() {
            this.forEach(function(sg) {
                sg.fetchStyle();
            });
        }
    });

    return StyleCollection;

}
);