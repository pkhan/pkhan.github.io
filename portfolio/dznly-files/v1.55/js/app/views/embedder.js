
define([
    'jquery',
    'app/views/modalcontrol',
    'app/wigevents'
    ], 
    function($, ModalControl, wigEvents) {
    var EmbedControl = (function() {
        return ModalControl.extend({
            state: '',
            html: '',
            modalInit: function() {
                var modal = this;
                this.targets = ['Embed'];
                this.listenTo(this.brick, 'embed', function() {
                    modal.promptCode();
                });
                this.$modalPrompt = false;
            },
            show: function() {
            },
            promptCode: function() {
                if(!this.$modalPrompt) {
                    this.$modalPrompt = $('#embed-modal');
                    this.$modalPrompt.modal({
                        show: false
                    });
                    this.$submit = this.$modalPrompt.find('.submit-embed');
                    this.$code = this.$modalPrompt.find('.embed-box');
                }
                this.$modalPrompt.modal('show');
                var embed = this;
                var ec = embed.brick.model.get('embed_code');
                if(!ec) {
                    ec = this.brick.$('.embed-wrap').html()
                }
                this.$code.val(ec.replace(/wwscr/g, 'script'));
                var submitHandler = function(evt) {
                    var code = embed.$code.val(),
                    $embedded;
                    embed.$submit.off('click', submitHandler);
                    embed.$modalPrompt.off('hide', cancelHandler);
                    try {
                        $embedded = $('<div class="embed-wrap"></div>').append($(code));
                    } catch (e) {
                        cancelHandler();
                        return;
                    }
                    $embedded.children().on('load', function() { 
                        embed.brick.$el.css({
                            height: $embedded.height(),
                            width: $embedded.width()
                        });
                        embed.brick.$content.css({
                            height: $embedded.height(),
                            width: $embedded.width()
                        });
                        embed.brick.deactivate();
                        embed.brick.activate();
                    });
                    // var $clone = $embedded.clone().wrapAll('<div></div>').parent();
                    // $clone.find('script').each(function() {
                    //     var $scr = $(this);
                    //     var $wwscr = $('<wwscr></wwscr>')[0].innerHTML = $scr.html();
                    //     $scr.replaceWith($wwscr);
                    // });
                    var safeCode = code.replace(/script/g, 'wwscr');
                    embed.brick.model.set('embed_code', safeCode);
                    try {
                        embed.brick.$content.find('.embed-wrap').replaceWith($embedded);
                    } catch(e) {}
                    if(code === '') {
                        cancelHandler();
                    }
                    embed.$code.val('');
                    embed.$modalPrompt.modal('hide');
                };
                this.$submit.on('click', submitHandler);
                var cancelHandler = function(evt) {
                    embed.$code.val(embed.brick.$('.embed-wrap').html());
                    if(embed.brick.$('.embed-wrap').html() === '') {
                        embed.brick.model.collection.remove(embed.brick.model);
                    }
                    embed.$submit.off('click', submitHandler);
                    embed.$modalPrompt.off('hide', cancelHandler);
                };
                this.$modalPrompt.on('hide', cancelHandler)
            }
        });
    })();

    return EmbedControl;
});