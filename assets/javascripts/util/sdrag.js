(function () {

    function sdrag(onDrag, onStop, direction) {

        var startX = 0;
        var startY = 0;
        var el = this;
        var dragging = false;

        function move(e) {

            var fix = {};
            onDrag && onDrag(el, e.pageX, startX, fix);
            
            if ('vertical' !== direction) {
                var pageX = ('pageX' in fix) ? fix.pageX : e.pageX;
                if ('startX' in fix) {
                    startX = fix.startX;
                }
                if (false === ('skipX' in fix)) {
                    el.style.left = (pageX - startX) + 'px';
                }
            }
        }

        function startDragging(e) {
            
            if (e.currentTarget instanceof HTMLElement || e.currentTarget instanceof SVGElement) {
                dragging = true;
                var left = el.style.left ? parseInt(el.style.left) : 0;
                startX = e.pageX - left;
               window.addEventListener('mousemove', move);
            }
            else {
                throw new Error("Your target must be an html element");
            }
        }

        this.addEventListener('mousedown', startDragging);
        
        window.addEventListener('mouseup', function (e) {
            
            if (true === dragging) {
                dragging = false;
                window.removeEventListener('mousemove', move);
                onStop && onStop(el, e.pageX, startX);
            }

        });
    }

    Element.prototype.sdrag = sdrag;

})();