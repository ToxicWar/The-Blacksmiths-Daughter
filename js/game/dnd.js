function DragObject(element, skill) {
    element.dragObject = this;

    dragMaster.makeDraggable(element);

    var rememberPosition;
    var mouseOffset;

    this.onDragStart = function(offset) {
        var s = element.style;
        rememberPosition = {top: s.top, left: s.left, position: s.position};
        s.position = 'absolute';

        mouseOffset = offset;
    };

    this.hide = function() {
        element.style.display = 'none';
    };

    this.show = function() {
        element.style.display = '';
    };

    this.onDragMove = function(x, y) {
        element.style.top =  y - mouseOffset.y +'px';
        element.style.left = x - mouseOffset.x +'px';
    };

    this.onDragSuccess = function(dropTarget) { };

    this.onDragFail = function() {
        var s = element.style;
        s.top = rememberPosition.top;
        s.left = rememberPosition.left;
        s.position = rememberPosition.position;
    };

    this.toString = function() {
        return element.id;
    };

    this.skill = function() {
        return skill;
    };
}

function DropTarget(element) {

    element.dropTarget = this;

    this.canAccept = function(relX, relY, dragObject) {
        return gameMaster.hoverAbilityReal(dragObject.skill(), relX, relY);
    };

    this.accept = function(relX, relY, dragObject) {
        this.onLeave();

        dragObject.hide();

        //core.emit('use-skill', dragObject.skill(), relX, relY);
        gameMaster.performAbilityReal(dragObject.skill(), relX, relY);
    };

    this.onLeave = function() {
        element.classList.remove('uponMe');
        
        gameMaster.highlighter.clear();
    };

    this.onEnter = function() {
        element.classList.add('uponMe');
    };

    this.toString = function() {
        return element.id
    }
}

var dragMaster = (function() {

    var dragObject;
    var mouseDownAt;

    var currentDropTarget;

    function mouseDown(e) {
        e = fixEvent(e);
        if (e.which!=1) return;

        mouseDownAt = { x: e.pageX, y: e.pageY, element: this };

        addDocumentEventHandlers();

        return false
    }

    function mouseMove(e){
        e = fixEvent(e);

        // (1)
        if (mouseDownAt) {
            if (Math.abs(mouseDownAt.x-e.pageX)<5 && Math.abs(mouseDownAt.y-e.pageY)<5) {
                return false
            }
            // Начать перенос
            var elem  = mouseDownAt.element;
            // текущий объект для переноса
            dragObject = elem.dragObject;

            // запомнить, с каких относительных координат начался перенос
            var mouseOffset = getMouseOffset(elem, mouseDownAt.x, mouseDownAt.y);
            mouseDownAt = null;  // запомненное значение больше не нужно, сдвиг уже вычислен

            dragObject.onDragStart(mouseOffset);  // начали

        }

        // (2)
        dragObject.onDragMove(e.pageX, e.pageY);

        // (3)
        var newTarget = getCurrentTarget(e);

        // (4)
        if (currentDropTarget != newTarget) {
            if (currentDropTarget) {
                currentDropTarget.onLeave()
            }
            if (newTarget) {
                newTarget.onEnter()
            }
            currentDropTarget = newTarget
        }

        // (5)
        return false
    }

    function mouseUp(e){
        if (!dragObject) { // (1)
            mouseDownAt = null
        } else {
            // (2)
            if (currentDropTarget) {
                currentDropTarget.accept(e.pageX, e.pageY, dragObject);
                dragObject.onDragSuccess(e.pageX, e.pageY, currentDropTarget);
            } else {
                dragObject.onDragFail();
            }

            dragObject = null;
        }

        // (3)
        removeDocumentEventHandlers();
    }

    function getMouseOffset(target, x, y) {
        var docPos= getOffset(target);
        return {x:x - docPos.left, y:y - docPos.top};
    }

    function getCurrentTarget(e) {
        // спрятать объект, получить элемент под ним - и тут же показать опять

        var x=e.pageX, y=e.pageY;

        // чтобы не было заметно мигание - максимально снизим время от hide до show
        dragObject.hide();
        var elem = document.elementFromPoint(x,y);
        dragObject.show();

        // найти самую вложенную dropTarget
        while (elem) {
            // которая может принять dragObject
            if (elem.dropTarget && elem.dropTarget.canAccept(x, y, dragObject)) {
                return elem.dropTarget
            }
            elem = elem.parentNode;
        }

        // dropTarget не нашли
        return null;
    }

    function addDocumentEventHandlers() {
        document.onmousemove = mouseMove;
        document.onmouseup = mouseUp;
        document.ondragstart = document.body.onselectstart = function() {return false}
    }
    function removeDocumentEventHandlers() {
        document.onmousemove = document.onmouseup = document.ondragstart = document.body.onselectstart = null
    }

    return {

        makeDraggable: function(element){
            element.onmousedown = mouseDown
        }
    }
}());

function fixEvent(e) {
    // получить объект событие для IE
    e = e || window.event;

    // добавить pageX/pageY для IE
    if ( e.pageX == null && e.clientX != null ) {
        var html = document.documentElement;
        var body = document.body;
        e.pageX = e.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
        e.pageY = e.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);
    }

    // добавить which для IE
    if (!e.which && e.button) {
        e.which = e.button & 1 ? 1 : ( e.button & 2 ? 3 : ( e.button & 4 ? 2 : 0 ) );
    }

    return e
}

function getOffset(elem) {
    if (elem.getBoundingClientRect) {
        return getOffsetRect(elem)
    } else {
        return getOffsetSum(elem)
    }
}

function getOffsetRect(elem) {
    var box = elem.getBoundingClientRect();

    var body = document.body;
    var docElem = document.documentElement;

    var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
    var clientTop = docElem.clientTop || body.clientTop || 0;
    var clientLeft = docElem.clientLeft || body.clientLeft || 0;
    var top  = box.top +  scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    return { top: Math.round(top), left: Math.round(left) }
}

function getOffsetSum(elem) {
    var top=0, left=0;
    while(elem) {
        top = top + parseInt(elem.offsetTop);
        left = left + parseInt(elem.offsetLeft);
        elem = elem.offsetParent
    }

    return {top: top, left: left}
}

core.on('window-onload', function() {
    // TODO: move declaration somewhere else (to LocalPlayer for example)
    var abilities = [new Ability.Bomb(2, 1), new Ability.Overcharge(5)];

    abilities.forEach(function(ability) {
        var dragElem = document.createElement('div');
        dragElem.className = "skill f_l";
        dragElem.textContent = ability.constructor.name;
        
        new DragObject(dragElem, ability);
        skills_container.appendChild(dragElem);
    });

    new DropTarget(document.querySelector('.battlefield'));
});
