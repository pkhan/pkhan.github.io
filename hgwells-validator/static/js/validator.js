

var validCodes = [
    '0112',
    '1218',
    '0904',
    '0412',
    '0519',
    '1506',
    '1521',
    '1815',
    '2314',
    '2009',
    '1305',
    '0114',
    '1923',
    '0518',
    '0504'
];

var Code = Backbone.Model.extend({
    defaults: {
        code: '',
        maxLen: 4
    },
    addOne: function(num) {
        var code = this.get('code');
        this.set('code', code + num);
        if(code.length === this.get('maxLen') - 1) {
           this.trigger('codeatmax', this.get('code'));
        }
    }
})

var App = Backbone.View.extend({
    el: '.my-container',
    events: {
        'touchend .num-pad .letter_box' : function(evt) {
            this.click = false;
            this.clickEvt(evt);
        },
        'click .num-pad .letter_box' : function(evt) {
            if(this.click) {
                this.clickEvt(evt);
            }
        }
    },
    initialize: function() {
        var app = this;
        this.timeout = 0;
        this.paused = false;
        this.click = true;
        this.code = new Code();
        this.listenTo(this.code, 'codeatmax', function(code) {
            this.validate(code);
        });
        this.listenTo(this.code, 'change:code', function(c, code) {
            var boxes = this.$display.find('span').text('');
            _.each(code, function(num, index) {
                boxes.eq(index).text(num);
            });
        });
    },
    clickEvt: function(evt) {
        var $tgt = $(evt.currentTarget);
        this.addNum($tgt.text());
        $tgt.css({
            'background-color' : 'white'
        });
        _.delay(function() {
            $tgt.css({
                'background-color' : ''
            });
        }, 300);
    },
    render: function() {
        var app = this;
        this.$message = this.$('.status span');
        this.$display = this.$('.display');
        this.$numpad = this.$('.num-pad');
        $(window).on('keyup', function(evt) {
            var num = -1,
            key = evt.which;
            if(48 <= key && key <= 57) {
                num = key - 48;
            } else if( 96 <= key && key <= 105) {
                num = key - 96;
            }
            if(num > -1) {
                app.addNum(num);
            }
        });
        $(window).on('touchstart touchmove', function(evt) {
            evt.preventDefault();
        });
        return this;
    },
    addNum: function(num) {
        if(this.paused) {
            this.reset();
        }
        this.code.addOne(num);
    },
    validate: function(code) {
        if(_.indexOf(validCodes, code) > -1) {
            this.$message.text('VALID')
            .removeClass('wrong');
        } else {
            this.$message.text('INVALID')
            .addClass('wrong');
        }
        this.pause();
    },
    pause: function() {
        var app = this;
        this.paused = true;
        this.timeout = window.setTimeout(function() {
            app.reset();
        }, 3000);
    },
    reset: function() {
        var app = this;
        app.code.set('code', '');
        app.$message.html('&nbsp;');
        this.paused = false;
        window.clearTimeout(this.timeout);
    }
});

$(document).ready(function() {
    var app = new App();
    app.render();
    window.app = app;
});