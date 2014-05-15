function Control(opts) {}
Control.add = function(opts) {
	var singleDown = opts.singleDown;
	var singleMove = opts.singleMove;
	var singleUp = opts.singleUp;
	
	var doubleDown = opts.doubleDown;
	var doubleMove = opts.doubleMove;
	var doubleUp = opts.doubleUp;
	
	var wheelRot = opts.wheelRot;
	
	var startElem = opts.startElem;
	var stopElem = opts.stopElem;
	
	function grab(e) {
		var box = startElem.getAbsoluteClientRect();
		singleDown(e.pageX-box.left, e.pageY-box.top) && e.preventDefault();
	}
	function move(e) {
		var box = startElem.getAbsoluteClientRect();
		singleMove(e.pageX-box.left, e.pageY-box.top) && e.preventDefault();
	}
	function drop(e) {
		singleUp(false) && e.preventDefault();
	}
	
	touch_numb = 0;
	function touchStart(e) {
		if (e.touches.length > 2) return;
		var box = startElem.getAbsoluteClientRect();
		var prevent = false;
		
		if (e.touches.length == 1) {
			var t = e.touches[0];
			prevent = singleDown(t.pageX-box.left, t.pageY-box.top);
		} else {
			if (touch_numb == 1) prevent = singleUp(true);
			var t0 = e.touches[0], t1 = e.touches[1];
			prevent += doubleDown(
				t0.pageX-box.left, t0.pageY-box.top,
				t1.pageX-box.left, t1.pageY-box.top
			);
		}

		if (prevent) e.preventDefault();
		touch_numb = e.touches.length;
	}
	
	function touchMove(e) {
		if (e.touches.length > 2) return;
		if (e.touches.length != touch_numb) return; //тут что-то нетак
		var box = startElem.getAbsoluteClientRect();
		
		if (e.touches.length == 1) {
			var t = e.touches[0];
			singleMove(t.pageX-box.left, t.pageY-box.top) && e.preventDefault();
		} else {
			var t0 = e.touches[0], t1 = e.touches[1];
			//мобильная Опера 12.04 в передёт тачи сюда в обратном порядке
			if (t0.identifier > t1.identifier) {var t=t0; t0=t1; t1=t;}
			doubleMove(
				t0.pageX-box.left, t0.pageY-box.top,
				t1.pageX-box.left, t1.pageY-box.top
			) && e.preventDefault();
		}
	}
	
	function touchEnd(e) {
		if (e.touches.length > 1) return;
		
		if (e.touches.length == 0) {
			(touch_numb == 2  // если подняли оба пальца сразу
				? doubleUp(false)
				: singleUp(false)
			) && e.preventDefault();
		} else {
			var box = startElem.getAbsoluteClientRect();
			var t = e.touches[0];
			(doubleUp(true) + singleDown(t.pageX-box.left, t.pageY-box.top)) && e.preventDefault();
		}
		
		touch_numb = e.touches.length;
	}
	
	startElem.addEventListener('mousedown', grab, true);
	startElem.addEventListener('mousemove', move, true);
	stopElem.addEventListener('mouseup', drop, true);
	startElem.addEventListener('touchstart', touchStart, true);
	startElem.addEventListener('touchmove', touchMove, true);
	stopElem.addEventListener('touchend', touchEnd, true);
	
	if (wheelRot) {
		startElem.addEventListener('mousewheel',     function(e){ wheelRot(e.wheelDelta/120) && e.preventDefault(); }, true);
		startElem.addEventListener('DOMMouseScroll', function(e){ wheelRot(e.detail)         && e.preventDefault(); }, true);
	}
}
