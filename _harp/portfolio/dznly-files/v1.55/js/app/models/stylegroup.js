define([
    'underscore',
    'backbone',
    'jquery'
],
function(_, Backbone, $) {

    var StyleProperty = Backbone.Model.extend({
        defaults: {
            prop: '',
            value: '',
            query: '',
            qp_id: ''
        },
        idAttribute: 'qp_id',
        initialize: function() {
            this.set('qp_id', this.get('query') + this.get('prop'));
        },
        print: function() {
            return this.get('prop') + ':' + this.get('value') + ';';
        }
    });

    var PropertyCollection = Backbone.Collection.extend({
        model: StyleProperty,
        print: function(query) {
            query = query || '';
            return this.reduce(function(group, prop) {
                if(prop.get('query') !== query) {
                    return group;
                }
                return group + prop.print();
            }, '');
        }
    });

    var StyleGroup = Backbone.Model.extend({
        defaults: function() {
            return {
                selector: '',
                properties: false
            };
        },
        initialize: function(attr, opt) {
            this.props = new PropertyCollection();
            this.query = '';
            this.disableAuto = !!opt.disableAuto;
            this.ignore = [];
            if(opt.$el) {
                this.$el = opt.$el;
                var elID = this.$el.attr('id');
                if(elID) {
                    this.set('selector', '#' + elID);
                }
            }
            var properties = this.get('properties');
            if(properties) {
                this.props.set(properties);
            }
            this.on('change:properties', function(sg, properties) {
                this.props.set(properties);
            });
        },
        setQuery: function(queryString) {
            this.query = queryString;
        },
        addStyle: function(prop, value) {
            this.props.add({
                prop: prop,
                value: value,
                query: this.query
            }, {
                merge: true
            });
        },
        readStyle: function(styleString) {
            var out = [];
            var sg = this;
            var otherQuery = this.query === '' ? false : true;
            if(styleString) {
                var styles = styleString.split(';');
                if(_.last(styles) === '') {
                    styles.pop();
                }
                _.forEach(styles, function(propString) {
                    var propVal = propString.split(':');
                    var value = propVal.slice(1).join(':');
                    var toAdd = {
                        prop: $.trim(propVal[0]),
                        value: value,
                        query: sg.query
                    };
                    if(toAdd.prop === 'background-image') {
                        if(sg.$el) {
                            if(sg.$el.css('background-size') === 'cover') {
                                var url = value || '';
                                url = url.replace('url(', '').replace(/'/g,'').replace(/\)$/,'');
                                out.push({
                                    query: sg.query,
                                    prop: '-ms-filter',
                                    value: '"progid:DXImageTransform.Microsoft.AlphaImageLoader( src=\'' + url + '\', sizingMethod=\'scale\')"'
                                });
                            }
                        }
                    }
                    var doPush = true;
                    if(otherQuery) {
                        var defProp = sg.props.get(toAdd.prop); // check if the default value for this property is the same
                        if(defProp) {
                            if(defProp.get('value') === toAdd.value) {
                                doPush = false;
                            }
                        }
                    } else {
                        var old = sg.props.get(toAdd.prop)
                        if(old) {
                            var oldVal = old.get('value');
                            if(oldVal !== toAdd.value) {
                                var queries = _.reject(_.unique(sg.props.pluck('query')), function(q) {
                                    return q === '';
                                });
                                var oldAdd = _.map(queries, function(q) {
                                    return {
                                        query: q,
                                        prop: toAdd.prop,
                                        value: oldVal
                                    };
                                });
                                sg.props.add(oldAdd);
                            }
                        }
                    }
                    if(doPush) {
                        out.push(toAdd);
                    }
                });
            }
            this.props.remove(this.props.where({query: this.query}))
            this.props.set(out, {remove: false});
        },
        fetchStyle: function() {
            if(!this.disableAuto) {
                this.readStyle(this.$el.attr('style'));
            }
        },
        replaceStyle: function(query) {
            query = query || this.query;
            var matched = this.props.where({query : query});
            var cssProps = _.reduce(matched, function(memo, sp) {
                memo[sp.get('prop')] = sp.get('value');
                return memo;
            }, {});
            if(query === '') {
                this.$el.removeAttr('style');
            }
            this.$el.css(cssProps);
            // this.$el.attr('style', this.props.print(this.query));
        },
        revert: function() {
            this.props.remove(this.props.reject(function(prop) {
                return prop.get('query') === '';
            }));
        },
        print: function() {
            return this.get('selector') + '{' + this.props.print('') + '}';
        },
        toJSON: function() {
            var out = Backbone.Model.prototype.toJSON.apply(this);
            out.properties = this.props.toJSON();
            return out;
        }
    });

    return StyleGroup;
}
);