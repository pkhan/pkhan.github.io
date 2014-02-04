
define([
    'underscore',
    'backbone',
    'jquery',
    'app/views/barview',
    'app/wigevents',
    'wysiwyg',
    'jqhotkeys'
    ], 
    function(_, Backbone, $, BarView, wigEvents) {
    var TextBar = BarView.extend({
        events: {
            'click .font-selector a' : function(evt) {
                var font = evt.target.innerHTML;
                evt.preventDefault();
                this.$fontSelector.text(font);
                _.each(this.active, function(pb) {
                    pb.view.$content.css({
                        'font-family' : font
                    });
                    pb.view.$content.find('a,span').each(function() {
                        var aTag = $(this);
                        aTag.css({
                            'font-family' : font
                        });
                    });
                });
                wigEvents.trigger('changepoint', 'Change Font');
                wigEvents.trigger('stylechange', 'Text', {
                    'font-family' : font
                });
            },
            'click .font-size button.font-ud': function(evt) {
                this.changeFontSize($(evt.currentTarget).data('edit'));
            },
            'submit #font-size-form': function(evt) {
                var size = this.$fontSize.val();
                evt.preventDefault();
                this.changeFontSize('font-to', size);
                this.$fontSize.blur();
            }
        },
        altEvents: {
            'click [data-edit=bold]' : function(evt) {
                var prop = this.active[0].view.$content.css('font-weight');
                prop = prop === 'bold' ? 'normal' : 'bold';
                _.each(this.active, function(pb) {
                    pb.view.$content.css({
                        'font-weight': prop
                    });
                });
                wigEvents.trigger('changepoint', 'Bold Text');
            },
            'click [data-edit=italic]' : function(evt) {
                var prop = this.active[0].view.$content.css('font-style');
                prop = prop === 'italic' ? 'normal' : 'italic';
                _.each(this.active, function(pb) {
                    pb.view.$content.css({
                        'font-style': prop
                    });
                });
                wigEvents.trigger('changepoint', 'Italicize Text');
            },
            'click [data-edit=underline]' : function(evt) {
                var prop = this.active[0].view.$content.css('text-decoration');
                prop = prop === 'underline' ? 'none' : 'underline';
                _.each(this.active, function(pb) {
                    pb.view.$content.css({
                        'text-decoration': prop
                    });
                });
                wigEvents.trigger('changepoint', 'Underline Text');
            },
            'click [data-edit=strikethrough]' : function(evt) {
                var prop = this.active[0].view.$content.css('text-decoration');
                prop = prop === 'line-through' ? 'none' : 'line-through';
                _.each(this.active, function(pb) {
                    pb.view.$content.css({
                        'text-decoration': prop
                    });
                });
                wigEvents.trigger('changepoint', 'Strikethrough Text');
            },
            'click [data-edit=justifyleft]' : function(evt) {
                _.each(this.active, function(pb) {
                    pb.view.$el.css({
                        'text-align': 'left'
                    });
                });
                wigEvents.trigger('changepoint', 'Align Text Left');
            },
            'click [data-edit=justifycenter]' : function(evt) {
                _.each(this.active, function(pb) {
                    pb.view.$el.css({
                        'text-align': 'center'
                    });
                });
                wigEvents.trigger('changepoint', 'Align Text Center');
            },
            'click [data-edit=justifyright]' : function(evt) {
                _.each(this.active, function(pb) {
                    pb.view.$el.css({
                        'text-align': 'right'
                    });
                });
                wigEvents.trigger('changepoint', 'Align Text Right');
            },
            'click [data-edit=justifyfull]' : function(evt) {
                _.each(this.active, function(pb) {
                    pb.view.$el.css({
                        'text-align': 'justify'
                    });
                });
                wigEvents.trigger('changepoint', 'Justify Text');
            }
        },
        barInit: function() {
            var textBar = this;
            this.$el.attr('data-role', 'editor-toolbar');
            this.$el.attr('data-target', '.slint-int');
            this.editing = false;
            this.types = ['Text', 'Interactive'];
            // this.oldSetActive = this.setActive;
            this.listenTo(wigEvents, 'edittext', function() {
                textBar.undelegateEvents();
                textBar.delegateEvents(textBar.events);
                textBar.editing = true;
            });
            this.listenTo(wigEvents, 'stopedittext', function() {
                textBar.delegateEvents(_.extend(_.clone(textBar.events), textBar.altEvents));
                textBar.editing = false;
            });
        },
        setActive: function(active) {
            var $elem = active[0].view.$content;
            this.$fontSelector.text($elem.css('font-family').split(',')[0].replace(/'/g,''));
            var sizes = _.uniq(_.map(active, function(pb) {
                return pb.view.$content.css('font-size');  
            }));
            if(sizes.length === 1) {
                this.$fontSize.val('').attr('placeholder', sizes[0].replace('px',''));
            } else {
                this.$fontSize.val('').attr('placeholder', '');
            }
            this.active = active;
        },
        show: function() {
            this.$el.css({
                display: 'inline-block'
            });
            if(!this.editing) {
                this.delegateEvents(_.extend(_.clone(this.events), this.altEvents));
            }
        },
        render: function() {
            // this.$el.html(this.html);
            this.$fontSelector = this.$('.current-font');
            this.$fontSize = this.$('.font-size-input');
            return this;
        },
        changeFontSize: function(edit, size) {
            var newSize;
            // var size = Number(this.$editing.css('font-size').replace('px',''));
            if(edit === 'font-up') {
                size = '+=5px';
            } else if(edit === 'font-down') {
                size = '-=5px';
            } else if(edit === 'font-to') {
                size = size + 'px';
            }
            var changes = 0,
            sizes = [];
            _.each(this.active, function(pb) {
                pb.view.$content.css('font-size', size);
                changes++;
                sizes.push(pb.view.$content.css('font-size'));
            });

            if(changes > 0) {
                sizes = _.uniq(sizes);
                if(sizes.length === 1) {
                    this.$fontSize.val('').attr('placeholder', sizes[0].replace('px',''));
                } else {
                    this.$fontSize.val('').attr('placeholder', '');
                }
            }

            wigEvents.trigger('stylechange', [this.active[0].get('name')], {
                'font-size' : this.active[0].view.$content.css('font-size')
            });
            wigEvents.trigger('changepoint', 'Change Font Size');
            // this.$editing.css('font-size', size);
        }
    });

    return TextBar;
});