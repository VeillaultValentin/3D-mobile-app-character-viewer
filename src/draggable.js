let element, eHeight, handle;
let offsetX, offsetY = 0;
export function makeElementTouchDraggable(UIelement) {
    element = UIelement;
    handle = document.createElement('div');
    handle.textContent = '.';
    handle.classList.add('grab');
    element.prepend(handle);
    eHeight = element.clientHeight;
    handle.onpointerdown = dragPointerDown;
    handle.onpointerup = clearDragEvents;
}

function dragPointerDown(e) {
    offsetX = element.offsetLeft - e.clientX + element.clientWidth / 2;
    offsetY = element.offsetTop - e.clientY + eHeight / 2;
    handle.ontouchmove = dragElement;
    handle.setPointerCapture(e.pointerId);
}

function dragElement(e) {
    let coords = e.targetTouches[0];
    if (coords.pageY >= 0 && coords.pageY <= window.innerHeight - 35) element.style.top = coords.pageY + offsetY + "px";
    if (coords.pageX >= 5 && coords.pageX <= window.innerWidth - 20) element.style.left = coords.pageX + offsetX + "px";
    element.style.maxHeight = 'calc(100% - ' + element.style.top + ')';
}

function clearDragEvents(e) {
    handle.onpointermove = null;
    handle.releasePointerCapture(e.pointerId);
}