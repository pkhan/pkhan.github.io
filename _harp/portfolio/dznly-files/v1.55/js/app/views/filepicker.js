
define([
    'jquery',
    'app/views/modalcontrol',
    'filepicker',
    'app/wigevents'
    ], 
    function($, ModalControl, filepicker, wigEvents) {
    var FilePickerControl = (function() {
        filepicker.setKey('Aot8fYXgVS2GWgufrTbEsz');
        return ModalControl.extend({
            state: 'hover',
            html: '',
            css: {
                cursor: 'pointer'
            },
            events: {
                'click' : 'pickImage'
            },
            modalInit: function() {
                var modal = this;
                this.targets = ['Image'];
                this.listenTo(this.brick, 'pickimage', function(size) {
                    modal.pickImage(size);
                });
                this.$spinner = $('<div class="dznly-remove"><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="48px" height="48px" viewbox="0 0 48 48" enable-background="new 0 0 16 16" xml:space="preserve" fill="#000000" class="svg replaced-svg"> <path d="M 45.00,27.00l-6.00,0.00 c-1.659,0.00-3.00-1.341-3.00-3.00c0.00-1.656, 1.341-3.00, 3.00-3.00l6.00,0.00 c 1.659,0.00, 3.00,1.344, 3.00,3.00C 48.00,25.659, 46.659,27.00, 45.00,27.00z M 36.726,15.516c-1.173,1.173-3.069,1.173-4.242,0.00s-1.173-3.069,0.00-4.242l 4.242-4.245 c 1.173-1.17, 3.069-1.17, 4.242,0.00c 1.173,1.173, 1.173,3.072,0.00,4.245L 36.726,15.516z M 24.00,48.00c-1.656,0.00-3.00-1.341-3.00-3.00l0.00,-6.00 c0.00-1.656, 1.344-3.00, 3.00-3.00 c 1.659,0.00, 3.00,1.344, 3.00,3.00l0.00,6.00 C 27.00,46.659, 25.659,48.00, 24.00,48.00z M 24.00,12.00C 22.344,12.00, 21.00,10.659, 21.00,9.00L21.00,3.00 c0.00-1.656, 1.344-3.00, 3.00-3.00c 1.659,0.00, 3.00,1.344, 3.00,3.00l0.00,6.00 C 27.00,10.659, 25.659,12.00, 24.00,12.00z M 11.271,40.971c-1.173,1.173-3.069,1.173-4.242,0.00s-1.173-3.072,0.00-4.242l 4.242-4.245 c 1.173-1.17, 3.072-1.17, 4.242,0.00c 1.173,1.173, 1.173,3.072,0.00,4.245L 11.271,40.971z M 11.271,15.516L 7.029,11.274 c-1.173-1.173-1.173-3.072,0.00-4.245c 1.173-1.17, 3.069-1.17, 4.242,0.00l 4.242,4.245c 1.173,1.173, 1.173,3.069,0.00,4.242 C 14.343,16.686, 12.444,16.686, 11.271,15.516z M 12.00,24.00c0.00,1.659-1.344,3.00-3.00,3.00L3.00,27.00 C 1.344,27.00,0.00,25.659,0.00,24.00c0.00-1.656, 1.344-3.00, 3.00-3.00l6.00,0.00 C 10.656,21.00, 12.00,22.344, 12.00,24.00z M 36.726,32.484l 4.242,4.245c 1.173,1.17, 1.173,3.069,0.00,4.242s-3.069,1.173-4.242,0.00l-4.242-4.242c-1.173-1.173-1.173-3.072,0.00-4.245 C 33.657,31.314, 35.556,31.314, 36.726,32.484z"></path></svg></div>');
                this.$spinner.find('svg').attr('style', '-webkit-animation:spin 2s infinite linear;-moz-animation:spin 2s infinite linear;animation:spin 2s infinite linear;');
                this.$spinner.css({
                    position: 'absolute',
                    width: 48,
                    height: 48,
                    top: '50%',
                    left: '50%',
                    'margin-left': '-24px',
                    'margin-top' : '-24px'
                });
            },
            show: function() {
                if(this.brick.model.get('name') === 'Image') {
                    this.$el.css({
                        top: this.brick.$el.height() - this.$el.height(),
                        left: 0
                    })
                    .show(); 
                }
            },
            showSpinner: function() {
                this.brick.$el.append(this.$spinner);
            },
            hideSpinner: function() {
                this.$spinner.detach();
            },
            pickImage: function(size) {
                var brick = this.brick,
                modal = this,
                firstPlacement = brick.model.firstPlacement;

                filepicker.pickAndStore({
                    mimetype: 'image/*',
                    multiple: false
                },
                {
                    location: 'S3',
                    access: 'public'
                },
                function(fpfiles) {
                    brick.$content.css({
                        background: 'white'
                    });
                    modal.showSpinner();
                    var url = window.config.UPLOADS_URL + window.encodeURIComponent(fpfiles[0].key);
                    $('<img/>').attr('src', url)
                    .on('load', function(evt){
                        brick.$content.css({
                            'background-color' : '',
                            'background-image': 'url("' + url + '")',
                            'background-size' : 'cover', //this.width + 'px ' + this.height + 'px',
                            'background-position' : 'center',//'0px 0px',
                            'width' : size ? size.width : this.width,
                            'height' : size ? size.height : this.height
                        });
                        brick.$el.css({
                            width: size ? size.width : this.width,
                            height: size ? size.height : this.height,
                        });
                        modal.hideSpinner();
                        modal.update();
                        brick.deactivate();
                        brick.activate();
                        wigEvents.trigger('changepoint', 'Change Image');
                    });
                },
                function() {
                    if(firstPlacement) {
                        brick.model.collection.remove(brick.model);
                    }
                });
            }
        });
    })();

    return FilePickerControl;
});