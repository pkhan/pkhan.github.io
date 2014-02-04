var Box = function(top, left, height, width) {
    height = height ? height : 0;
    width = width ? width : 0;

    this.top = top;
    this.left = left;
    this.height = height;
    this.width = width;
    this.bottom = top + height;
    this.right = left + width;
};

Box.prototype.vCenter = function() {
    return parseInt(this.top + this.height / 2)
};

Box.prototype.hCenter = function() {
    return parseInt(this.left + this.width / 2)
};

Box.prototype.getAspect = function() {
    return this.width / this.height;
};

Box.prototype.resizeAR = function(yDiff, xDiff) {
    var newSize = {
        height: this.height,
        width: this.width
    },
    aRatio = this.getAspect(); // (width/height)
    if(xDiff === 0) {
        newSize.height = this.height + yDiff;
        newSize.width = this.width + (yDiff * aRatio);
    } else {
        newSize.width = this.width + xDiff;
        newSize.height = this.height + (xDiff / aRatio);
    }
    this.height = newSize.height;
    this.width = newSize.width;
    return this;
};

Box.prototype.relativeTo = function(box) {
    this.top = this.top - box.top;
    this.left = this.left - box.left;
    this.bottom = this.top + this.height;
    this.right = this.left + this.width;
    return this;
};

Box.prototype.overlap = function(box){
    if(this.right < box.left) {
        return false;
    }
    if(this.bottom < box.top) {
        return false;
    }
    if(box.right < this.left) {
        return false;
    }
    if(box.bottom < this.top) {
        return false;
    }
    return true;
};

Box.prototype.overlapBox = function(box) {
    var overlap = new Box(0, 0, 0, 0);
    if(!this.overlap(box)) {
        return false;
    }
    overlap.left = this.left < box.left ? box.left : this.left;
    overlap.top = this.top < box.top ? box.top : this.top;
    overlap.width = Math.max(0, Math.min(this.right, box.right) - Math.max(this.left, box.left));
    overlap.height = Math.max(0, Math.min(this.bottom, box.bottom) - Math.max(this.top, box.top));
    overlap.right = overlap.left + overlap.width;
    overlap.bottom = overlap.top + overlap.height;
    return overlap;
};

Box.prototype.surround = function(box) {
    var top = box.top < this.top ? box.top : this.top;
    var left = box.left < this.left ? box.left : this.left;
    var bottom = box.bottom > this.bottom ? box.bottom : this.bottom;
    var right = box.right > this.right ? box.right : this.right;

    return new Box(top, left, bottom - top, right - left);
};

Box.prototype.justBox = function() {
    return {
        top: this.top,
        left: this.left,
        height: this.height,
        width: this.width
    };
};

(function($) {

    $.fn.getBox = function() {
        var btop,
        bleft,
        bwidth,
        bheight,
        $elem,
        offset,
        thisW,
        thisH,
        first = true;

        this.each(function(){
            $elem = $(this);
            offset = $elem.offset();
            if(first) {
                btop = offset.top;
                bleft = offset.left;
                bwidth = $elem.width();
                bheight = $elem.height();
                first = false;
            } else {
                if(offset.top < btop) {
                    btop = offset.top;
                }
                if (offset.left < bleft) {
                    bleft = offset.left;
                }
                thisH = offset.top - btop + $elem.height();
                thisW = offset.left - bleft + $elem.width();

                if(thisH > bheight) {
                    bheight = thisH;
                }
                if(thisW > bwidth) {
                    bwidth = thisW;
                }

            }
        });

        return new Box(btop, bleft, bheight, bwidth);
    };

    $.fn.inViewPort = function(scrollRegion) {
        scrollRegion = scrollRegion || {};
        scrollRegion = _.extend({
            top: 0,
            left: 0,
            bottom: 0,
            right: 0
        }, scrollRegion);

        var vpBox = {
                //145 represents the height of the fixed pos elements at the top of the screen
            top: window.scrollY + scrollRegion.top,
            left: window.scrollX + scrollRegion.left,
            bottom: window.scrollY + window.innerHeight - scrollRegion.bottom,
            right: window.scrollX + window.innerWidth - scrollRegion.right
        };

        var intBox = this.getBox();
        var overlap = intBox.overlapBox(vpBox);
        return overlap;
    };

})(window.jQuery);