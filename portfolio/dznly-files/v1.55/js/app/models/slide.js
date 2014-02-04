
define([
    'backbone', 
    'underscore',
    'app/collections/brickcollection'
    ], 
    function(Backbone, _, BrickCollection) {
	var Slide = Backbone.Model.extend({
        defaults: {
            name: 'Slide',
            bricks: [],
            height: 600,
            slide_html: '',
            order_index: -1,
            slide_style: '',
            style_sheet: '',
            is_template: false
        },
        initialize: function() {
            var sl = this;
            this.bc = new BrickCollection();
            this.bc.slide = this;
            this.on('childupdate', function() {
                sl.bc.set(sl.get('bricks'));
                if(sl.view) {
                    sl.view.$el.attr('style', sl.get('slide_style'));
                    sl.view.$slideInt.css('height', sl.get('height'));
                }
            });

            this.trigger('childupdate');
            if(this.get('order_index') === -1) {
                if(this.collection) {
                    this.set('order_index', this.collection.length, {silent:true});
                }
            }

            // setTimeout(function() {
            //     sl.bc.add(sl.get('bricks'));
            // }, 30);
        },
        orderDown: function() {
            var oldOrder = this.get('order_index');
            if(oldOrder < this.collection.maxOrderIndex()) {
                this.set('order_index', oldOrder + 1);
            }
        },
        orderUp: function() {
            var oldOrder = this.get('order_index');
            if(oldOrder > 0) {
                this.set('order_index', oldOrder - 1);
            }
        },
        cloneJSON: function() {
            var out = _.omit(this.toJSON(),
                'id',
                'resource_uri',
                ''
            );
            return out;
        },
        toJSON: function() {
            var out = _.omit(_.clone(this.attributes),'pk'),
            $clone = this.view.$slideInt.clone(),
            slide = this;
            out.bricks = [];
            var innerStr = '';
            var classPrefix = 'el';
            var styleSheet = '';
            var outerSel = '#section-' + this.get('id');
            styleSheet += outerSel + '{margin:0;' + this.get('slide_style') + '}';
            styleSheet += outerSel + ' .slide-int{box-shadow:none;height:' + this.get('height') + 'px;' + '}';
            this.bc.forEach(function(pb, index) {
                pb.set('slide', slide.get('resource_uri'));
                pb.updateBox();
                out.bricks.push(pb.toJSON());
                innerStr += pb.getHtml({
                    class: classPrefix + index,
                    inlineStyles: false
                });
                if(pb.styleGroup) {
                    pb.styleGroup.set('selector', outerSel + ' .' + classPrefix + index);
                    pb.contentStyle.set('selector', outerSel + ' .' + classPrefix + index +' .brick-content');

                    pb.styleGroup.fetchStyle();
                    pb.contentStyle.fetchStyle();

                    styleSheet += pb.styleGroup.print('');
                    styleSheet += pb.contentStyle.print('');
                }
            });

            out.style_sheet = styleSheet;

            var fontArr = [];

            this.bc.forEach(function(pb) {
                var rawFont = pb.view.$content.css('font-family') || '';
                var font = rawFont.replace(/'/g,''),
                fontPath = window.fonts[font];
                if(!!fontPath) {
                    fontArr.push(fontPath);
                }
            });

            out.fonts = _.unique(fontArr).join('|');

            out.slide_style = this.view.$el.attr('style');
            $clone = $('<div></div>').append($(innerStr));
            $clone.find('.brick-modal,.slide-resizer,.dznly-remove').remove();
            $clone.find('*').removeClass('highlighted active-brick');
            $clone.find('[contenteditable=true]').removeAttr('contenteditable');
            $clone.find('font').each(function() {
                 var inner = this.innerHTML,
                 $font = $(this);
                 $span = $('<span></span>')
                 .html(inner)
                 .attr('style', $font.attr('style'))
                 .css({
                     color: this.color
                 });
                 $(this).replaceWith($span);
            });
            var slide_html = $clone.html() || '';
            slide_html = slide_html.replace(/\s{2}/g, ' &nbsp;');
            out.slide_html = slide_html;
            if(out.slide_type && !out.has_content) {
                out.bricks = [];
            }
            return out;
        },
        urlRoot: '/api/v1/slides/'
    });

    return Slide;
});