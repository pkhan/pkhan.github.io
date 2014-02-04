
define([
    'app/wigbackbone', 
    'underscore',
    'app/collections/slidecollection'
    ], 
    function(Backbone, _, SlideCollection) {
    var Stack = Backbone.Model.extend({
        defaults: function() {
            return {
                name: 'Stack Name',
                domain: '',
                slides: [],
                fonts: '',
                global_slides: [],
                publish: false
            };
        },
        initialize: function() {
            var stack = this;
            // this.sc = new SlideCollection();
            // this.sc.add(this.get('slides'));
            this.sc = new SlideCollection();
            this.siteSlides = new SlideCollection();
            this.on('childupdate', function() {
                stack.sc.set(stack.get('slides'));
                stack.sc.forEach(function(slide) {
                    slide.trigger('childupdate');
                });
                stack.sc.trigger('render:now');
                var globalSlides = site_json.global_slides;
                var usedSlides = _.filter(stack.get('global_slides'), function(slide) {
                    return slide.has_content;
                });
                // globalSlides = _.filter(globalSlides, function(slide) {
                //     return _.indexOf(usedSlides, slide.resource_uri) > -1 && slide.has_content;
                // });
                // stack.siteSlides.set(globalSlides);
                stack.siteSlides.set(usedSlides);
                stack.siteSlides.forEach(function(slide) {
                    slide.trigger('childupdate');
                });
            });
            this.trigger('childupdate');
        },
        getSiteSlide: function(type) {
            //type being Header or Footer
            return this.siteSlides.findWhere({
                slide_type: type
            });
        },
        toJSON: function() {
            var fontStr = 'http://fonts.googleapis.com/css?family=',
                fontArr = [];

            function getFonts(slide) {
                slide.bc.forEach(function(pb) {
                    var rawFont = pb.view.$content.css('font-family') || '';
                    var font = rawFont.replace(/'/g,''),
                    fontPath = window.fonts[font];
                    if(!!fontPath) {
                        fontArr.push(fontPath);
                    }
                });
            }
            this.sc.forEach(getFonts);
            this.siteSlides.forEach(getFonts);
            fontStr += _.unique(fontArr).join('|');
            this.set('fonts', fontStr);
            var out = _.omit(_.clone(this.attributes), 'pk'),
            stack = this;
            out.slides = [];
            this.sc.forEach(function(slide) {
                slide.set('stack', stack.get('resource_uri'));
                out.slides.push(slide.toJSON());
            });
            out.global_slides = [];
            this.siteSlides.forEach(function(slide){
                out.global_slides.push(slide.toJSON());
            });
            // delete(out.site.global_slides);
            // out.site = {
            //     resource_uri: window.site_info.resource_uri
            // };
            return out;
        },
        urlRoot: '/api/v1/stacks/'
    });

    return Stack;
});
