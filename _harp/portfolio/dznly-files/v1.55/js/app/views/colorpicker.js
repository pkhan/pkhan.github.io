define([
	'underscore',
	'backbone',
	'jquery',
  'app/wigevents'
	],
function(_, Backbone, $, wigEvents) {

function rgb2hex(rgb){
 rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
 var res = '';
 try {
   res = "#" +
    ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
    ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
    ("0" + parseInt(rgb[3],10).toString(16)).slice(-2);
  } catch(e) {
    res = '';
  }
  return res;
}

var Color = Backbone.Model.extend({
    defaults: {
      hex: 'FFEEAA'
    },
    idAttribute: 'hex'
  });

  var ColorView = Backbone.View.extend({

    tagName: 'a',
    className: 'swatch',

    events: {
      'click' : 'changeColor',
      'submit form' : function(evt) {
        evt.preventDefault();
      }
    },

    initialize: function(){
      this.$el.attr('href', '#');
    },

    render: function() {
      this.$el.css({
        'background-color': '#' + this.model.get('hex')
      });
      return this;
    },

    changeColor: function(evt){
      evt.preventDefault()
      this.model.trigger('changecolor', this);
    }
  });

  var Palette = Backbone.Collection.extend({
    model: Color,
    toUrlString: function() {
      return this.pluck('hex').join('-');
    }
  });


  var ColorPicker = Backbone.View.extend({
    el: '#picker-panel', 
    events: {
      'click' : function(evt) {
        evt.stopPropagation();
      }
    },
    initialize: function(stack){
      this.lastHexUrl = 'ffffff';
      this.stack = stack;
      var picker = this;
      this.started = false;
      picker.usedColors = new Palette();
      picker.standardColors = new Palette();
      picker.suggestedColors = new Palette();
      picker.suppressChange = false;

      this.listenTo(wigEvents, 'pickcolor', function($button, position, initColor){
        if(initColor) {
          picker.suppressChange = true;
          $.farbtastic('#colorpicker').setColor(rgb2hex(initColor));
        }
        picker.show($button, position);
      });

      this.listenTo(wigEvents, 'appstart', function(appView) {
        picker.appView = appView;
        picker.updateUsed();
        picker.getSuggested();
        picker.started = true;
      });

      this.listenTo(this.standardColors, 'add', function(color){
        color.view = new ColorView({model: color});
        color.view.render();
        picker.$('#standard-palette').append(color.view.el);
      });

      this.listenTo(this.usedColors, 'add', function(color){
        color.view = new ColorView({model: color});
        color.view.render();
        // picker.$('#used-palette').append(color.view.el);
      });

      this.listenTo(this.usedColors, 'reset', function(){
        // picker.$('#used-palette').empty();
        var frag = document.createDocumentFragment();
        picker.usedColors.forEach(function(color) {
          frag.appendChild(color.view.el);
        });
        picker.$('#used-palette').html(frag);

        // picker.$('#suggested-palette').empty();
      });

      this.listenTo(this.suggestedColors, 'add', function(color) {
        color.view = new ColorView({model: color});
        color.view.render();
        picker.$('#suggested-palette').append(color.view.el);
      });

      this.listenTo(this.suggestedColors, 'reset', function() {
        var frag = document.createDocumentFragment();
        picker.suggestedColors.forEach(function(color) {
          color.view = new ColorView({model: color});
          color.view.render();
          frag.appendChild(color.view.el);
        })
        picker.$('#suggested-palette').html(frag);
      });

      this.listenTo(this.usedColors, 'changecolor', function(view){ 
        updateColor(view); 
      });
      this.listenTo(this.standardColors, 'changecolor', function(view){ 
        updateColor(view); 
      });
      this.listenTo(this.suggestedColors, 'changecolor', function(view){ 
        updateColor(view); 
      });

      var standardPalette = ["3ECAAF", "1ECE6D", "2C97DE", "9C55B8", "32485F", "3DB49D", "4DBF7D", "227FBB", "8F3FAF", "2A3D50", "F3C502", "E87E02", "EA4A34", "ECF0F1", "94A5A6", "F7B031", "D65301", "C23723", "BDC3C7", "7E8C8D"];

      _.each(standardPalette, function(h){
        var c = new Color({hex: h});
        picker.standardColors.add(c);
      });

      this.suggestedColors.parse = function(data) {
        var newData = _.map(data, function(rawColor) {
          return {
            hex: rawColor
          };
        });
        return newData;
      };

      var changeReceiver = _.debounce(function(color) {
        // picker.usedColors.add({
        //   hex: color.replace('#','')
        // });
        if(picker.started) {
          picker.updateUsed();
          picker.getSuggested();
          // wigEvents.trigger('changepoint', 'Change Color');
        }
      }, 1000);

      this.$('#color').on('wwcolorchange', function(evt, color) {
        if(picker.suppressChange){
          picker.suppressChange = false;
        } else {
          wigEvents.trigger('colorpicked', color);
          // wigEvents.trigger('stylechange', 'Shapes', {
          //   'background-color' : color
          // });
          // wigEvents.trigger('stylechange', 'Text', {
          //   color : color
          // });

          changeReceiver(color);
        }
      });

      var updateColor = function(view){
        $.farbtastic('#colorpicker').setColor('#'+view.model.get('hex'));
      };

      var updateColorHex = function(hexVal) {

      };
    },
    initUsed: function(colors) {
      var usedPalette = colors.slice(0,5);
      _.each(usedPalette, function(h){
        var c = new Color({hex: h.replace('#','')});
        picker.usedColors.add(c);
      });
    },
    updateUsed: function() {
      var usedColors,
      picker = this, 
      objs;
      usedColors = this.retrieveUsedColors()
      objs = _.map(usedColors, function(h) {
        return{
          hex: h.replace('#', '')
        };
      });
      picker.usedColors.set(objs);
      picker.usedColors.trigger('reset');
    },
    getSuggested: function() {
      var hexUrl = this.usedColors.toUrlString();
      this.lastHexUrl = hexUrl;
      hexUrl = hexUrl === '' ? 'ffffff' : hexUrl;
      this.suggestedColors.fetch({
        type:         'GET',
        dataType:     'jsonp',
        url:      'http://dribbble-colors.herokuapp.com/hex/' + hexUrl + '.json',
        jsonp:    "jsonpCallback",
        reset: true
      });
    },
    show: function($elem, position) {
      var offset,
      picker = this;
      if(position === 'fixed') {
        offset = $elem.position();
      } else {
        offset = $elem.offset();
      }
      this.$el.css({
        position: position,
        top: offset.top + 20,
        left: _.max([offset.left - this.$el.width(),0]),
        'z-index': 9999999999
      });

      this.updateUsed();

      if(this.lastHexUrl !== this.usedColors.toUrlString()) {
        this.getSuggested();
      }

      this.$el.show();
      this.clickHandler = function(evt){
        picker.hide();
      };
      $(document).on('click', this.clickHandler);
    },
    hide: function() {
      this.$el.hide();
      $(document).off('click', this.clickHandler);
      wigEvents.off('colorpicked');
    },
    retrieveUsedColors: function() {
      var noMatch = ['#000000', '#ffffff', ''],
      colors = [],
      frequency,
      appView = this.appView;

      var eachSlide = function(slide) {
        var color = rgb2hex(slide.view.$el.css('background-color'));
        if(_.indexOf(noMatch, color) === -1){
          colors.push(color);
        }
        slide.bc.forEach(function(pb) {
          var color = '',
          category = pb.get('category');
          if(category === 'Shapes'){
            color = rgb2hex(pb.view.$content.css('background-color'));
            if(_.indexOf(noMatch, color) === -1){
              colors.push(color);
            }
          } else if (category === 'Text') {
            color = rgb2hex(pb.view.$content.css('color'));
            if(_.indexOf(noMatch, color) === -1){
              colors.push(color);
            }
            pb.view.$content.find('*').each(function(){
              var subColor = rgb2hex($(this).css('color'));
              if(_.indexOf(noMatch, subColor) === -1) {
                colors.push(subColor);
              }
            });
          }
        });
      };

      appView.stack.sc.forEach(eachSlide);
      appView.stack.siteSlides.forEach(eachSlide);

      frequency = _.countBy(colors, function(color) {
        return color;
      });

      return _.pluck(_.sortBy(_.pairs(frequency), function(pair) { return -1 * pair[1]; }), 0);

    }
  });

return ColorPicker;

})