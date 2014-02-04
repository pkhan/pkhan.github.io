
define(['backbone', 'underscore', 'app/models/brick'], function(Backbone, _, Brick) {
	var PlacedBrick = Brick.extend({
        defaults: {
            position: {
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                height: 0,
                width: 0
            },
            stackOrder: 0,
            style: '',
            wrapper: ''
        },
        initialize: function() {
            this.set('position', _.clone(this.get('position')));
        },
        updateBox: function() {
            var $el = this.view.$el,
            new_pos = $el.position(),
            width = $el.width(),
            height = $el.height(),
            pos = _.clone(this.get('position')),
            oldAttr = _.clone(this.attributes),
            newAttr;

            oldAttr.position = _.clone(oldAttr.position);

            if($.contains(document.documentElement, this.view.el)) {
                pos.top = new_pos.top;
                pos.left = new_pos.left;
                pos.right = new_pos.left + width;
                pos.bottom = new_pos.top + height;
                pos.width = width;
                pos.height = height;
            }

            this.set('position', pos);
            var $clone = this.view.$content.clone();
            $clone.find('.dznly-remove').remove();
            $el.css({
                'pointer-events': ''
            });
            $clone.find('*').addBack().removeAttr('contenteditable');

            // $clone.find('script').each(function() {
            //     var $scr = $(this),
            //     $wwscr = $('<wwscr></wwscr>').html($scr.html());
            //     $scr.replaceWith($wwscr);
            // });
            var newHtml = '';
            if($clone.length > 0) {
                newHtml = $clone[0].outerHTML;
                if(this.get('category') === 'Embed') {
                    newHtml = newHtml.replace(/script/g, 'wwscr');
                }
            }
            

            this.set('html', newHtml);
            this.set('style', $el.attr('style'));

            newAttr = _.clone(this.attributes);
            newAttr.position = _.clone(newAttr.position);

            this.trigger('update', this, oldAttr, newAttr);
        },
        getStyle: function() {
            var pos = this.get('position');
            var style = '';

            style += 'top:' + pos.top + 'px;'
            style += 'left:' + pos.left + 'px;'
            style += 'width:' + pos.width + 'px;'
            style += 'height:' + pos.height + 'px;'
        },
        updateView: function() {
            var attr = this.attributes;

            this.view.$el.attr('style', attr.style);

            this.view.setContent(attr.html);
        },
        getHtml: function(opt) {
            var options = {
                class: false,
                inlineStyles: true
            }; 
            _.extend(options, opt);
            var html;
            if(this.view) {
                html = this.view.$el[0].outerHTML;
            } else {
                html = '<div class="brick-full" style="' + this.getStyle() + '">' + this.get('html').replace(/wwscr/g, 'script') + '</div>';
            }
            // var html = this.get('html');
            var $clone = $(html);
            if(this.get('category') === 'Embed') {
                var embed_code = this.get('embed_code') || '';
                $clone.find('.embed-wrap').html(embed_code.replace(/wwscr/g, 'script').replace(/\s{2,}/g, ' '));
            }
            if(options.class) {
                $clone.addClass(options.class);
            }
            if(!options.inlineStyles) {
                $clone.removeAttr('style');
                $clone.find('.brick-content').removeAttr('style');
            }

            html = $clone[0].outerHTML;
            return html;
        }
    });

    return PlacedBrick;
});