App = new Backbone.Marionette.Application();

App.baseUrl = "https://query.yahooapis.com/v1/public/yql";

App.templates = {};

Handlebars.registerHelper('ifEquals', function(a, b, options) {
    if (a === b) {
      return options.fn(this)
    }
    else {
      return options.inverse(this)
    }
});

var yqlSync = function(method, model, options) {
    var params = {
        dataType: 'jsonp',
        url: App.baseUrl,
        data: {
            q: "USE 'http://www.datatables.org/nextbus/nextbus.routes.xml' AS nextbus.routes; SELECT * FROM nextbus.routes",
            format: 'json'
        }
    };
    var modelParams = model.getParams();
    if(modelParams !== '') {
        params.data.q += ' WHERE ' + modelParams;
    }
    var xhr = Backbone.ajax(_.extend(params, options));
    model.trigger('request', model, xhr, options);
    return xhr;
};

var getParams = function() {
    var result = '(';
    first = true;
    params = this.params();
    if (_.isEmpty(params)) {
        return '';
    }
    for (k in params) {
        if (params.hasOwnProperty(k) && params[k]) {
            if(!first) {
                result += ' AND ';
            }
            result += ' ' + k + '=\'' + params[k] + '\'';
            first = false;
        }
    }
    result += ' )';
    return result
};

var yqlParse = function(data, options) {
    if (!data.query) {
        return data;
    }
    if (data.query.results) {
        return data.query.results[this.name];
    }
    return {};
};

var yqlMixin = {
    sync: yqlSync,
    name: '',
    params: function() {
        return {};
    },
    getParams: getParams,
    parse: yqlParse
};

App.Model = Backbone.Model.extend(yqlMixin);

App.Collection = Backbone.Collection.extend(yqlMixin);

App.Models = {};
App.Collections = {};
App.Views = {};

App.Models.Route = App.Model.extend({
    idAttribute: 'tag',
    name: 'route',
    initialize: function() {
        this.stops = new App.Collections.Stops();
        this.stops.route = this;
    },
    params: function() {
        return {
            route: this.get('tag')
        }
    },
    parse: function() {
        data = App.Model.prototype.parse.apply(this, arguments);
        if (data.stop) {
            this.stops.reset(data.stop);
            this.stops.invoke('set', { route: data.tag});
        }
        return data;
    }
});

App.Collections.Routes = App.Collection.extend({
    model: App.Models.Route,
    name: 'route'
});

App.Models.Stop = App.Model.extend({
    idAttribute: 'stopId'
});

App.Collections.Stops = App.Collection.extend({
    model: App.Models.Stop
});

function defaultArray(potential) {
    if(_.isArray(potential)) {
        return potential;
    }
    return [ potential ];
}

App.Models.Prediction = App.Model.extend({
    name: 'prediction',
    defaults: function() {
        return {
            route: null,
            direction: null,
            stop: null,
            route_name: 'Select a Route',
            direction_name: 'And a Direction',
            stop_name: 'And a Stop',
            editing: true
        };
    },
    initialize: function() {
        var prediction = this;
        if (!App.routes) {
            App.routes = new App.Collections.Routes();
        }
        this.routes = App.routes;
        if (this.routes.length == 0 && !this.get('route')) {
            this.routes.fetch().done(function() {
                prediction.trigger('sync', prediction);
            });
        }
    },
    setRoute: function(routeTag) {
        var prediction = this;
        this.route = this.routes.get(routeTag);
        this.set({
            route: routeTag,
            route_name: this.route.get('title'),
            direction: null,
            stop: null
        });
        this.route.fetch().done(function() {
            prediction.trigger('sync', prediction);
        });
    },
    setDirection: function(direction) {
        this.direction = _.findWhere(this.route.get('direction'), {tag: direction});
        this.set({
            direction: direction,
            direction_name: this.direction.title,
            stop: null
        });
        this.trigger('sync', this);
    },
    setStop: function(stopId, silent) {
        this.stop = this.route.stops.get(stopId);
        this.set('stop', stopId);
        this.set('stop_name', this.stop.get('title'));
        if(!silent){
            this.set('editing', false);
        }
        this.trigger('complete', this);
        this.fetch();
    },
    resurrect: function() {
        // Rebuild route info if necessary (for editing)
        var self = this;
        var routeTag = this.get('route');
        var directionId = this.get('direction');
        var stopId = this.get('stop');
        if (!(routeTag && directionId && stopId)) {
            return;
        }
        var deferreds = [];
        if (this.routes.length == 0) {
            deferreds.push(this.routes.fetch());
        }
        if (this.route) {
            return;
        }
        $.when.apply($, deferreds).then(function() {
            self.route = self.routes.get(routeTag);
            self.route.fetch().done(function() {
                self.trigger('sync', self);
            });
        });
    },
    params: function() {
        return {
            route: this.get('route'),
            direction: this.get('direction'),
            stop: this.get('stop')
        };
    },
    parse: function(data, options) {
        var results = {};
        if (data.query) {
            data = data.query.results.predictions;
        }
        if (data.direction) {
            var prediction_groups = defaultArray(data.direction);
            prediction_groups = prediction_groups.map(function(group, i, groups) {
                return {
                    title: group.title,
                    predictions: defaultArray(group.prediction).map(function(prediction) {
                        return {
                            time: moment(Number(prediction.epochTime)).format('hh:mm A'),
                            minutes: prediction.minutes
                        };
                    })
                };
            });
            _.extend(results, {
                prediction_groups: prediction_groups,
                direction_name: prediction_groups[0].title
            });
        } else {
            _.extend(results, {
                prediction_groups: [{
                    title: data.dirTitleBecauseNoPredictions,
                    predictions: [ { time: 'No current predictions'} ]
                }]
            });
        }
        _.extend(results, {
            route_name: data.routeTitle,
            stop_name: data.stopTitle,
        });
        return results;
    },
    toJSON: function() {
        data = App.Model.prototype.toJSON.apply(this);
        data.routes = this.routes.toJSON();
        if (this.route) {
            data.directions = this.route.get('direction');
            var stops = this.route.get('stop');
            if (this.direction) {
                var validStops = _.pluck(this.direction.stop, 'tag');
                stops = _.filter(stops, function(stop) {
                    return validStops.indexOf(stop.tag) >= 0;
                });
                stops = _.sortBy(stops, function(stop) {
                    return validStops.indexOf(stop.tag);
                });
            }
            data.stops = stops;
        }
        return data;
    }
});

App.Collections.Predictions = App.Collection.extend({
    model: App.Models.Prediction,
    name: 'prediction',
    initialize: function() {
        this.on('complete', function(model) {
            this.updateHash();
        });
        this.on('remove', function(model) {
            this.updateHash();
        });
    },
    getParams: function() {
        return this.invoke('getParams').join(' OR ');
    },
    parse: function(data, options) {
        data = data.query.results.predictions;
        if (!_.isArray(data)) {
            data = [data];
        }
        var index = 0;
        data.forEach(function(prediction) {
            prediction.id = index++;
        });
        return data;
    },
    fetch: function() {
        var index = 0;
        this.forEach(function(prediction) {
            prediction.set('id', index++);
        });
        return App.Collection.prototype.fetch.apply(this, arguments);
    },
    updateHash: function() {
        var hashString = '?';
        var joinChar = '&';
        var first = true;
        this.forEach(function(prediction) {
            if (!first) {
                hashString += '&';
            }
            first = false;
            hashString += 'route=' + prediction.get('route');
            hashString += '&direction=' + prediction.get('direction');
            hashString += '&stop=' + prediction.get('stop');
        });
        App.router.navigate(hashString);
    }
});

App.Router = Backbone.Router.extend({
    routes: {
        '(?)*muniRoutes' : 'init'
    },
    shared: function() {

    },
    init: function(muniRoutes) {
        if(App.reNav) {
            App.router.navigate('?' + muniRoutes);
            App.reNav = false;
        }
        App.predictions = new App.Collections.Predictions();

        if (muniRoutes) {
            var arr = muniRoutes.split('&');
            var models = [];
            var current;
            arr.forEach(function(param) {
                var args = param.split('=');
                if (args[0] === 'route') {
                    current = {};
                    models.push(current);
                }
                current[args[0]] = args[1];
                current[args[0] + '_name'] = args[1] + ' Loading';
                current.editing = false;
            });
            App.predictions.set(models);
            App.predictions.fetch();
        }

        App.pl = new App.Views.PredictionList({
            el: '#prediction-wrapper',
            collection: App.predictions
        });

        App.pl.render();
    }
});

App.router = new App.Router();

$(document).ready(function() {

    $('script[type="text/template"]').each(function() {
        App.templates[this.id] = Handlebars.compile(this.innerHTML);
    });

    App.Views.Prediction = Backbone.Marionette.ItemView.extend({
        template: App.templates['prediction-template'],
        className: 'row',
        modelEvents: {
            'sync': 'render'
        },
        ui: {
            'routeList' : '.route-list',
            'directionList' : '.direction-list',
            'stopList' : '.stop-list'
        },
        events: {
            'change @ui.routeList' : function(evt) {
                this.model.setRoute(this.ui.routeList.val());
            },
            'change @ui.directionList' : function(evt) {
                this.model.setDirection(this.ui.directionList.val());
            },
            'change @ui.stopList' : function(evt) {
                this.model.setStop(this.ui.stopList.val());
            },
            'click .refresh' : function(evt) {
                evt.preventDefault();
                this.model.fetch();
            },
            'click .prediction-edit' : function(evt) {
                evt.preventDefault();
                this.model.resurrect();
                this.model.set('editing', true);
                this.render();
            },
            'click .prediction-cancel-edit' : function(evt) {
                evt.preventDefault();
                this.model.set('editing', false);
                this.render();
            },
            'click .prediction-remove' : function(evt) {
                evt.preventDefault()
                this.model.collection.remove(this.model);
            }
        }
    });

    App.Views.PredictionList = Backbone.Marionette.CollectionView.extend({
        itemView: App.Views.Prediction,
        collectionEvents: {
            'sync': function (model) {
                if(model === this.collection) {
                    this.render();
                }
            }
        }
    });

    $('#add-prediction').on('click', function(evt) {
        evt.preventDefault();
        App.predictions.add({});
    });
    $('#reload-all').on('click', function(evt) {
        evt.preventDefault();
        App.predictions.fetch();
    });

    App.reNav = false;
    if(window.location.hash.length > 0) {
        App.reNav = true;
    }
    Backbone.history.start({pushState: true, root: '/muni/'});
});
