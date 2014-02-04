(function(jQuery) {
    // the following variables are set on a drag start event to keep track of where the mouse pointer is inside an block
    var xl = null;
    var xr = null;
    var yt = null;
    var yb = null;
    var xc = null;
    var yc = null;
    var slide;
    var peerSelector;
    var otherBricks;
    var otherBrickBoxes;

    jQuery.fn.top = function() {
        var o = $(this[0]);
        return Math.round(o.position().top);
    };

    jQuery.fn.left = function() {
        var o = $(this[0]);
        return Math.round(o.position().left);
    };

    jQuery.fn.bottom = function() {
        var o = $(this[0]);
        return Math.round(o.top() + o.height());
    };

    jQuery.fn.right = function() {
        var o = $(this[0]);
        return Math.round(o.left() + o.width());
    };

    jQuery.fn.hCenter = function() { //horizontal lying center
        var o = $(this[0]);
        return parseInt(o.top() + (o.height()/2.0));
    };

    jQuery.fn.vCenter = function() { //vertical lying center
        var o = $(this[0]);
        return parseInt(o.left() + (o.width()/2.0));
    };

    jQuery.fn.wigSnap = function() {
        var arg = arguments[0],
        ui = {},
        event = arg.event;

        if(arg.mode === 'start') {
            slide = arg.slide;
            peerSelector = arg.sel,
            grid = arg.grid,
            innerX = event.pageX - slide.offset().left,
            innerY = event.pageY - slide.offset().top;
            // innerX = event.pageX,
            // innerY = event.pageY;

            xl = innerX - this.left();
            xr = this.right() - innerX;
            yt = innerY - this.top();
            yb = this.bottom() - innerY;
            xc = parseInt(innerX - this.vCenter());
            yc = parseInt(innerY - this.hCenter());

            otherBricks = slide.find(peerSelector).not('.active-brick');
            otherBrickBoxes = [];
            otherBricks.each(function() {
                var $brick = $(this);
                var box = new Box(
                    $brick.top(),
                    $brick.left(),
                    $brick.height(),
                    $brick.width()
                );
                otherBrickBoxes.push(box);
            });

        } else if(arg.mode === 'snap') {
            ui.position = {
                top: this.position().top,
                left: this.position().left
            };

            moveSnap(this, event, ui, grid);
            this.css(ui.position);
            this.drawLines({width: 1, height: 1});
            this.updateRulers();

        } else if(arg.mode === 'stop') {
            removeLines();
            turnOffRulers();
        }
    };

    jQuery.fn.wigResizeSnap = function() {
        var arg = arguments[0],
        ui = {},
        event = arg.event;
        var brick;

        if(arg.mode === 'start') {
            slide = arg.slide;
            handle = arg.handle;
            peerSelector = arg.sel,
            grid = arg.grid,
            // NATE turned off fixed aspect ratio
            aspectFixed = false, //arg.aspectFixed,
            // innerX = event.pageX - slide.offset().left,
            // innerY = event.pageY - slide.offset().top;
            innerX = event.pageX,
            innerY = event.pageY;

            xl = innerX - this.left();
            xr = this.right() - innerX;
            yt = innerY - this.top();
            yb = this.bottom() - innerY;
            aspectRatio = this.width()/this.height();
            startBottom = this.bottom();
            startRight = this.right();

            otherBricks = slide.find(peerSelector).not(this);
            otherBrickBoxes = [];
            otherBricks.each(function() {
                var $brick = $(this);
                var box = new Box(
                    $brick.top(),
                    $brick.left(),
                    $brick.height(),
                    $brick.width()
                );
                otherBrickBoxes.push(box);
            });

        } else if(arg.mode === 'snap') {

            ui.position = {
                top: this.position().top,
                left: this.position().left,
                width: this.width(),
                height: this.height()
            };

            var exclude = arg.exclude || '';

            resizeSnap(this, event, ui, handle, grid, arg.matchClass, exclude, arg.sizeOnly, arg.ignoreSlide);

            this.css(ui.position);
            if(!arg.skipLines) {
                this.drawLines({hCenter: 1, vCenter: 1});
                this.updateRulers();
            }

        } else if(arg.mode === 'stop') {
            if(arg.matchClass) {
                otherBricks.removeClass(arg.matchClass);
                this.removeClass(arg.matchClass);
            }
            removeLines();
            turnOffRulers();
        }
    };

    var closeXAxis = function( o1, o2 ){
        return o1.top() <= o2.bottom() && o2.top() <= o1.bottom();
    };

    var closeYAxis = function( o1, o2 ){
        return o1.left() <= o2.right() && o2.left() <= o1.right();
    };

    var resizeSnap = function(o, event, ui, handle, grid, matchClass, exclude, sizeOnly, ignoreSlide){
        var nearestXSnap = 999; 
        var nearestYSnap = 999; 
        var oBox = new Box(
            o.top(),
            o.left(),
            o.height(),
            o.width()
        );

        var closeX, closeY;

        if(exclude.match('x')) {
            closeX = function() {
                return false;
            }
        } else {
            closeX = function(n1, n2){
                var diff = Math.abs(n1-n2);
                var doUpdate = (diff < 5) && diff < nearestXSnap;
                if (doUpdate){
                    nearestXSnap = diff;
                }
                return doUpdate;
            };
        }

        if(exclude.match('y')) {
            closeY = function() {
                return false;
            }
        } else {
            closeY = function(n1, n2){
                var diff = Math.abs(n1-n2);
                var doUpdate = (diff < 5) && diff < nearestYSnap;
                if (doUpdate){
                    nearestYSnap = diff;
                }
                return doUpdate;
            };
        }


        //SNAPPING TO GRID
        if(grid){
            if(handle.hasClass('NE') || handle.hasClass('E') || handle.hasClass('SE')) {
                if(closeX(((event.pageX + xr)%70), 50)){ 
                    //set Right to right
                    ui.position.width = o.width() + (50-((event.pageX + xr)%70));
                }
            }
            if(handle.hasClass('NW') || handle.hasClass('W') || handle.hasClass('SW')) { 
                if(closeX(((event.pageX - xl+30)%70), 30)){ 
                    //set left to left
                    ui.position.width = o.width() + ((30+event.pageX - xl)%70) - 30;
                    ui.position.left = o.left() - ((30+event.pageX - xl)%70) + 30;
                }
            }
        }

        //SNAPPING TO STAGE 
        if(!ignoreSlide) {
            if(handle.hasClass('NE') || handle.hasClass('E') || handle.hasClass('SE')) {
                if(closeX(event.pageX + xr, slide.width())){ 
                    ui.position.width = slide.width() - o.left();
                }
            }
            if(handle.hasClass('NW') || handle.hasClass('W') || handle.hasClass('SW')) {
                if(closeX(event.pageX - xl, 0)){ 
                    ui.position.left = 0;
                    ui.position.width = o.right();
                }
            }
            if(handle.hasClass('NE') || handle.hasClass('N') || handle.hasClass('NW')) {
                if(closeY(event.pageY - yt, 0)){ 
                    ui.position.top = 0;
                    ui.position.height = o.bottom();
                }
            }
            if(handle.hasClass('SW') || handle.hasClass('S') || handle.hasClass('SE')) {
                if(closeY(event.pageY + yb, slide.height())){ 
                    ui.position.height = slide.height() - o.top();
                }
            }
        }

        var matchCount = 0;
        var lastMatch;

        $.each(otherBrickBoxes, function(i){
            // console.log($(this).right());
            // console.log(event.pageX + xr);
            var $ob = otherBricks.eq(i);
            var ob_same = false;

            if(handle.hasClass('NE') || handle.hasClass('E') || handle.hasClass('SE')) {
                if(!sizeOnly) {
                    if(closeX(event.pageX + xr, this.right )){
                        ob_same = true;
                        //set right to right
                        ui.position.width = this.right - oBox.left;
                    }
                    if(closeX(event.pageX + xr, this.left)){ 
                        ob_same = true;
                        //set right to the left
                        ui.position.width = this.left - oBox.left;
                    }
                }
                //width
                if(closeX(oBox.width, this.width)){
                    ob_same = true;
                    ui.position.width = this.width;
                }
            } 
            if(handle.hasClass('NW') || handle.hasClass('W') || handle.hasClass('SW')) {  
                if(!sizeOnly) {
                    if(closeX(event.pageX - xl, this.left)) { 
                        ob_same = true;
                        //set left to left
                        ui.position.left = this.left;
                        ui.position.width = oBox.right - this.left;
                    }
                    if(closeX(event.pageX - xl, this.right)) { 
                        ob_same = true;
                        //set left to right
                        ui.position.left = this.right;
                        ui.position.width = oBox.right - this.right;
                    }
                }
                //width
                if(closeX(oBox.width, this.width )) {
                    ob_same = true;
                    ui.position.width = this.width;
                    ui.position.left = oBox.right - this.width;
                }
            }
            
            if(handle.hasClass('NE') || handle.hasClass('N') || handle.hasClass('NW')) {
                if(!sizeOnly) {
                    if(closeY(event.pageY - yt, this.top)) { 
                        ob_same = true;
                        //set top to top
                        ui.position.top = this.top;
                        ui.position.height = oBox.bottom - this.top;
                    }
                    if(closeY(event.pageY - yt, this.bottom)) { 
                        ob_same = true;
                        //set top to bottom
                        ui.position.top = this.bottom;
                        ui.position.height = oBox.bottom - this.bottom;
                    }
                }
                //height
                if(closeX(oBox.height, this.height)) {
                    ob_same = true;
                    ui.position.height = this.height;
                    ui.position.top = oBox.bottom - this.height;
                }
            }

            if(handle.hasClass('SW') || handle.hasClass('S') || handle.hasClass('SE')) {
                if(!sizeOnly) {
                    if(closeY(event.pageY + yb, this.top)){
                        ob_same = true;
                        //set bottom to top
                        ui.position.height = this.top - oBox.top;
                    }
                    if(closeY(event.pageY + yb, this.bottom)) { 
                        ob_same = true;
                        //set bottom to bottom
                        ui.position.height = this.bottom - oBox.top;
                    }
                }
                //height
                if(closeY(oBox.height, this.height)) {
                    ob_same = true;
                    ui.position.height = this.height;
                }
            }

            if(ob_same && matchClass) {
                matchCount++;
                // otherBricks.removeClass(matchClass);
                // $ob.addClass(matchClass);
                lastMatch = $ob;
            }
        });
            
        // if there is a match class, apply it to all matched bricks
        if(matchCount === 0 && matchClass) {
            o.removeClass(matchClass);
            otherBricks.removeClass(matchClass);
        } else if(matchClass) {
            o.addClass(matchClass);
            targetH = lastMatch.height();
            otherBricks.filter(function(){
                return $(this).height() === targetH;
            }).addClass(matchClass);
        }

        if(aspectFixed){
            if(handle.hasClass('N') || handle.hasClass('S') || handle.hasClass('NE')) {
                // w = (h/start_pos.boxH)*start_pos.boxW;
                ui.position.width = Math.round(ui.position.height * aspectRatio);
            }else{
                // h = (w/start_pos.boxW)*start_pos.boxH;
                ui.position.height = Math.round(ui.position.width / aspectRatio);
            }
            if(handle.hasClass('NW')){
                ui.position.top = startBottom - ui.position.height;
            }
        }

    }




    var moveSnap = function(o, event, ui, grid){
        var nearestXSnap = 99999; 
        var nearestYSnap = 99999; 

        var closeX = function(n1, n2){
            var diff = Math.abs(n1-n2);
            var doUpdate = (diff < 5) && diff < nearestXSnap;
            if (doUpdate){
                nearestXSnap = diff;
            }
            return doUpdate;
        }

        var closeY = function(n1, n2){
            var diff = Math.abs(n1-n2);
            var doUpdate = (diff < 5) && diff < nearestYSnap;
            if (doUpdate){
                nearestYSnap = diff;
            }
            return doUpdate;
        }


        //SNAPPING TO STAGE
        s = slide;
        var pageX = event.pageX - slide.offset().left;
        var pageY = event.pageY - slide.offset().top;

        if(closeX(pageX + xr, s.width())){ 
            ui.position.left = s.width() - o.width();
        }
        if(closeX(pageX - xl, 0)){ 
            ui.position.left = 0;
        }
        if(closeY(pageY - yt, 0)){ 
            ui.position.top = 0;
        }
        if(closeY(pageY + yb, s.height())){ 
            ui.position.top = s.height() - o.height();
        }
        
        if(closeX(pageX - xc, parseInt((s.width()/2)))){ 
            ui.position.left = parseInt((s.width()/2)-(o.width()/2));
        }
        if(closeY(pageY - yc, parseInt((s.height()/2)))){ 
            ui.position.top = parseInt((s.height()/2)-(o.height()/2));
        }

        //SNAPPING TO GRID
        if(grid){
            if(closeX(((pageX + xr)%70), 50)){ 
                //set Right to right
                ui.position.left = (pageX - xl) + (50-((pageX + xr)%70));
            }
            if(closeX(((pageX - xl+30)%70), 30)){ 
                //set left to left
                ui.position.left = (pageX - xl) - ((30+pageX - xl)%70) + 30;
            }
        }


        // SNAPPING TO OTHER BRICKS
        var oWidth = o.width();
        var oHeight = o.height();
        $.each(otherBrickBoxes, function(){

            // SNAPPING X POSITIONS
            

            if(closeX(pageX + xr, this.right)){ 
                //set Right to right
                ui.position.left = this.right - oWidth;
            }
            if(closeX(pageX - xl, this.left)){ 
                //set left to left
                ui.position.left = this.left;
            }
            if(closeX(pageX - xl, this.right)){ 
                //set left to right
                ui.position.left = this.right;
            }
            if(closeX(pageX + xr, this.left)){ 
                //set right to the left
                ui.position.left = this.left - oWidth;
            }

            // SNAPPING Y POSITIONS
            if(closeY(pageY - yt, this.top)){ 
                //set top to top
                ui.position.top = this.top;
            }
            if(closeY(pageY + yb, this.bottom)){ 
                //set bottom to bottom
                ui.position.top = this.bottom - oHeight;
            }
            if(closeY(pageY + yb, this.top)){
                //set bottom to top
                ui.position.top = this.top - oHeight;
            }
            if(closeY(pageY - yt, this.bottom)){ 
                //set top to bottom
                ui.position.top = this.bottom;
            }
            
            // SNAPPING CENTERS
            if(closeX(pageX - xc, this.hCenter())){ 
                ui.position.left = this.hCenter()-parseInt(oWidth/2);
            }
            if(closeY(pageY - yc, this.vCenter())){ 
                ui.position.top = this.vCenter()-parseInt(oHeight/2);
            }

            //SNAPPING GAPS

        });
    }


    var drawH = function(n, o1, o2, frag){
        var styles = "width: 100%; left: 0; border-color: orange";
        if(o1 != undefined && o2 != undefined){
            var left = o1.left < o2.left ? o1.left : o2.left;  
            var right = o1.right > o2.right ? o1.right : o2.right; 
            styles = "width: " + (right-left) + "px ; left: " + left + "px;";
        }
        // var linePresent = $('#h'+n).length;
        var linePresent = !!frag.querySelector('#h' + n);
        var line = $('<div class="hLine" id="h'+n+'" style="top: '+n+'px;'+styles+'"></div>');
        if(!linePresent){ 
            // slide.append(line);
            frag.appendChild(line[0]);
        };
    };

    var drawV = function(n, o1, o2, frag){
        var styles = "height: 100%; top: 0; border-color: orange";
        if(o1 != undefined && o2 != undefined){
            var top = o1.top < o2.top ? o1.top : o2.top;  
            var bottom = o1.bottom > o2.bottom ? o1.bottom : o2.bottom; 
            styles = "height: " + (bottom-top) + "px ; top: " + top + "px;";
        }
        // var linePresent = $('#v'+n).length;
        var linePresent = !!frag.querySelector('#v' + n);
        var line = $('<div class="vLine" id="v'+n+'" style="left: '+n+'px; '+ styles +'"></div>');
        if(!linePresent){ 
            // slide.append(line);
            frag.appendChild(line[0]);
        };
    };

    // draw a matching width
    var drawWidth = function(o, frag){
        // var linePresent = $('#hh'+o.left()+o.top()).length;
        var linePresent = !!frag.querySelector('#hh'+o.left+o.top);
        var line = $('<div class="hLine" id="hh'+o.left+o.top+'" style="left: '+o.left+'px; top: '+(o.top-10)+'px; width: '+ o.width+'px"></div>');

        var tab1 = $('<div class="vLine" id="hh'+o.left+o.top+'" style="left: '+o.left+'px; top: '+(o.top-15)+'px; height: 10px"></div>');
        var tab2 = $('<div class="vLine" id="hh'+o.left+o.top+'" style="left: '+o.right+'px; top: '+(o.top-15)+'px; height: 10px"></div>');
        if(!linePresent){ 
            // slide.append(line);
            // slide.append(tab1);
            // slide.append(tab2);
            frag.appendChild(line[0]);
            frag.appendChild(tab1[0]);
            frag.appendChild(tab2[0]);
        }
    };

    // draw a matching height
    var drawHeight = function(o, frag){
        var linePresent = !!frag.querySelector('#vv'+o.left+o.top);
        // var linePresent = $('#vv'+o.left()+o.top()).length;
        var line = $('<div class="vLine" id="vv'+o.left+o.top+'" style="top: '+o.top +'px; left: '+(o.left-10)+'px; height: '+ o.height +'px"></div>');

        var tab1 = $('<div class="hLine" id="vv'+o.left+o.top+'" style="left: '+(o.left-15)+'px; top: '+o.top+'px; width: 10px"></div>');
        var tab2 = $('<div class="hLine" id="vv'+o.left+o.top+'" style="left: '+(o.left-15)+'px; top: '+o.bottom+'px; width: 10px"></div>');
        if(!linePresent){ 
            // slide.append(line);
            // slide.append(tab1);
            // slide.append(tab2);
            frag.appendChild(line[0]);
            frag.appendChild(tab1[0]);
            frag.appendChild(tab2[0]);
        }
    };

    var removeLines = function(){
        $(".vLine,.hLine").remove();
    }

    var turnOnRulers = function(){
        //add rulers
        if($('.hRuler, .vRuler').length == 0){
            // var slide = appView.activeSlide.$slideInt;
            
            hRuler = $('<div class="hRuler" style="width: '+ ($(slide).width()) +'px; height: 10px;"><div class="hMarker"></div></div>');
            vRuler = $('<div class="vRuler" style="width: 10px; height: '+ ($(slide).height()-10) +'px;"><div class="vMarker"></div></div>');
            slide.before(hRuler);
            slide.before(vRuler);
        }
    }

    jQuery.fn.updateRulers = function(){
        turnOnRulers();
        var hMarker = $(".hRuler").find(".hMarker");
        var vMarker = $(".vRuler").find(".vMarker");
        
        hMarker.css("margin-left", $(this).left()+"px");
        hMarker.css("width", $(this).width()+"px");

        vMarker.css("margin-top", ($(this).top()-10)+"px");
        vMarker.css("height", $(this).height()+"px");
    }

    var turnOffRulers = function(){
        $(".hRuler, .vRuler").remove();
    }


    jQuery.fn.drawLines = function(except){
        var o = $(this);
        oBox = new Box(
            o.top(),
            o.left(),
            o.height(),
            o.width()
        );
        if(except === undefined){ except = {}; };
        $(".vLine, .hLine").remove();
        var frag = document.createDocumentFragment();
        $.each(otherBrickBoxes, function(i) {
            var $ob = $(otherBricks[i]);
            if(!except.left){
                if(oBox.left == this.left){ drawV(oBox.left, oBox, this, frag) };
                if(oBox.left == this.right){ drawV(oBox.left, oBox, this, frag) };
            };
            if(!except.top){
                if(oBox.top == this.top){ drawH(oBox.top, oBox, this, frag) };
                if(oBox.top == this.bottom){ drawH(oBox.top, oBox, this, frag) }; 
            };
            if(!except.right){
                if(oBox.right == this.left){ drawV(oBox.right, oBox, this, frag) };
                if(oBox.right == this.right){ drawV(oBox.right, oBox, this, frag) };
            };
            if(!except.bottom){
                if(oBox.bottom == this.top){ drawH(oBox.bottom, oBox, this, frag) };
                if(oBox.bottom == this.bottom){ drawH(oBox.bottom, oBox, this, frag) };
            };
            if(!except.vCenter){
                if(oBox.vCenter() == this.vCenter()){ drawH(oBox.vCenter(), oBox, this, frag) };
            };
            if(!except.hCenter){
                if(oBox.hCenter() == this.hCenter()){ drawV(oBox.hCenter(), oBox, this, frag) };
            };
            if(!except.width){
                if(oBox.width == this.width){
                    drawWidth(this, frag);
                    drawWidth(oBox, frag);
                };
            }; 
            if(!except.height){
                if(oBox.height == this.height){
                    drawHeight(this, frag);
                    drawHeight(oBox, frag);
                };
            }; 
        });

        if(!except.vCenter){
            var slideCenter = parseInt((slide.height()/2));
            if(Math.abs(oBox.vCenter() - slideCenter)<2){ 
                drawH(oBox.vCenter(), undefined, undefined, frag) 
            }
        };
        if(!except.hCenter){
            var slideCenter = parseInt((slide.width()/2));
            if(Math.abs(oBox.hCenter() - slideCenter)<2){ 
                drawV(oBox.hCenter(), undefined, undefined, frag) 
            }
        }; 
        slide.append(frag);
    }

})(window.jQuery);