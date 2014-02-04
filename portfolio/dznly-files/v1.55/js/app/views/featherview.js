define([
    'underscore',
    'backbone', 
    'jquery',
    'app/wigevents',
    'filepicker'
    ],
function(_, Backbone, $, wigEvents, filepicker) {

    var FeatherView = Backbone.View.extend({
        initialize: function() {
            var fv = this;
            this.activePb = false;
            this.mode = 'brick';
            this.featherEditor = new Aviary.Feather({
                apiKey: 'mmpfdxsp333bshn8',
                apiVersion: 3,
                tools: 'crop,enhance,warmth,focus,effects,orientation,brightness,contrast,saturation,warmth,sharpness,splash,draw,redeye,whiten,blemish',
                theme: 'light',
                appendTo: '',
                onSave: function(imageID, newURL) {
                    fv.afterSave(imageID, newURL);
                    // fv.updateImage(imageID, newURL);
                },
                onError: function(errorObj) {
                  // alert(errorObj.message);
                }
            });
            this.listenTo(wigEvents, 'image:edit', function(pb) {
                this.startAviary(pb);
            });
            this.listenTo(wigEvents, 'image:bkgedit', function(sv) {
                this.startAviaryBkg(sv);
            });
        },
        afterSave : function(imageID, newURL) {
            if(this.mode === 'brick') {
                this.updateImage(imageID, newURL);
            } else if(this.mode ==='bkg') {
                this.updateBkg(imageID, newURL);
            }
        },
        startAviaryBkg: function(sv) {
            var imgURL = sv.$el.css('background-image');
            this.sv = sv;
            this.mode = 'bkg';
            if(!imgURL) {
                return;
            }
            imgURL = imgURL.replace('url(', '').replace(')', '').replace(/[",']/g, '');
            var img = document.createElement('img');
            img.src = imgURL;
            this.featherEditor.launch({
                image: img,
                url: imgURL
            });
        },
        updateBkg: function(imageID, newURL) {
            fv = this;
            this.featherEditor.close();
            filepicker.store({
                url: newURL
            }, function(fpFile) {
                destURL = window.config.UPLOADS_URL + window.encodeURIComponent(fpFile.key);
                fv.sv.$el.css({
                    'background-image': 'url(' + destURL + ')',
                });
                wigEvents.trigger('changepoint', 'Edit Background Image');
            });

        },
        startAviary: function(pb) {
            if(pb.get('category') !== 'Image') {
                return;
            }
            var imgURL = pb.view.$content.css('background-image');
            if(!imgURL) {
                return;
            }
            this.mode = 'brick';
            this.activePb = pb;
            imgURL = imgURL.replace('url(', '').replace(')', '').replace(/[",']/g, '');
            var img = document.createElement('img');
            img.src = imgURL;
            this.featherEditor.launch({
                image: img,
                url: imgURL
            });
        },
        updateImage: function(imageID, newURL) {
            var dim = this.featherEditor.getImageDimensions();
            var aspect = dim.width / dim.height;
            var destURL = newURL;
            var pb = this.activePb;
            pb.updateBox();
            var oldDim = pb.get('position');
            this.featherEditor.close();
            filepicker.store({
                url: newURL
            }, function(fpFile) {
                destURL = window.config.UPLOADS_URL + window.encodeURIComponent(fpFile.key);
                pb.view.hideSpinner();
                var newHeight = Math.round( (1 / aspect) * oldDim.width );
                pb.view.$content.css({
                    'background-image': 'url(' + destURL + ')',
                    height: newHeight
                });
                pb.view.$el.css({
                    height: newHeight
                });
                pb.updateBox();
                pb.view.deactivate();
                pb.view.activate(false);
                wigEvents.trigger('changepoint', 'Edit Image');
            });
            pb.view.showSpinner();
        }
    });

    return FeatherView;
});