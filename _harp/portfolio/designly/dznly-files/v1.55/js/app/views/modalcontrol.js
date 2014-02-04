
define([
    'backbone'
    ], 
    function(Backbone) {
    var ModalControl = Backbone.View.extend({
        tagName: 'div',
        className: 'brick-modal',
        state: 'always', //state is 'always', 'hover', or 'active'
        css: {},
        initialize: function(args) {
            this.targets = ['Heading', 'Text', 'Image', 'Button', 'Circle', 'Square'];
            this.brick = args.brick;
            this.modalInit(args);
            this.el.contentEditable = false;
        },
        modalInit: function(args) {

        },
        show: function() {
            this.$el.show();
        },
        render: function() {
            this.$el.append(this.html)
            .css({
                'background-color': 'white'
            })
            .css(this.css)
            .hide();
            return this;
        },
        update: function() {
            this.brick.model.updateBox();
        },
        enable: function() {
            this.delegateEvents(this.events);
        },
        disable: function() {
            this.undelegateEvents();
        }
    });

    return ModalControl;
});