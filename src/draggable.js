let ELEMENT, HANDLE;
let OFFSET_X, OFFSET_Y = 0;
let CSS_ADDED = false; //prevents including CSS multiple times

export function makeElementTouchDraggable(UIelement) {
    ELEMENT = UIelement;
    HANDLE = document.createElement('div');
    HANDLE.textContent = '⁝⁝';
    HANDLE.classList.add('grab');
    ELEMENT.prepend(HANDLE);
    HANDLE.onpointerdown = dragPointerDown;
    HANDLE.onpointerup = clearDragEvents;

    if (!CSS_ADDED) addCSS();
}

function dragPointerDown(e) {
    OFFSET_X = ELEMENT.offsetLeft - e.clientX + ELEMENT.clientWidth / 2;
    OFFSET_Y = ELEMENT.offsetTop - e.clientY;
    HANDLE.addEventListener('touchmove', dragElement, { passive: false });
    HANDLE.addEventListener('pointermove', dragElement, { passive: false });
    HANDLE.setPointerCapture(e.pointerId);
}

function dragElement(e) {
    let coords;
    if (e instanceof PointerEvent) coords = e;
    else if (e instanceof TouchEvent) coords = e.targetTouches[0];

    if(coords.clientX + OFFSET_X < window.innerWidth + ELEMENT.offsetWidth / 2 - HANDLE.offsetWidth && coords.clientX + OFFSET_X > ELEMENT.offsetWidth / 2) ELEMENT.style.left = coords.clientX + OFFSET_X + "px";
    if(coords.clientY + OFFSET_Y < window.innerHeight - ELEMENT.offsetHeight && coords.clientY + OFFSET_Y > 0) ELEMENT.style.top = coords.clientY + OFFSET_Y + "px";
    ELEMENT.style.maxHeight = "calc(100% - " + ELEMENT.style.top + ")";
}

function clearDragEvents(e) {
    HANDLE.removeEventListener('touchmove', dragElement);
    HANDLE.removeEventListener('pointermove', dragElement);
    HANDLE.releasePointerCapture(e.pointerId);
}

function addCSS() {
    let style = document.createElement('style');
    style.textContent = `
    .grab {
        color: #fff;
        text-shadow: 1px 1px 1px rgba(255, 255, 255, 0.3);

        padding-left: 0.65em;
        padding-right: 0.5em;
        display: flex;
        flex-flow: wrap;
        align-content: center;
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 2em;
        font-weight: bolder;
    }
    `
    document.head.appendChild(style);
    CSS_ADDED = true;
}