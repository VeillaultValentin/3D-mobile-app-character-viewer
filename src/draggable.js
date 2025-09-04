let element, eHeight, handle;
let offsetX, offsetY = 0;
let cssAdded = false; //prevents including CSS multiple times

export function makeElementTouchDraggable(UIelement) {
    element = UIelement;
    handle = document.createElement('div');
    handle.textContent = '.';
    handle.classList.add('grab');
    element.prepend(handle);
    eHeight = element.clientHeight;
    handle.onpointerdown = dragPointerDown;
    handle.onpointerup = clearDragEvents;

    if (!cssAdded) addCSS();
}

function dragPointerDown(e) {
    offsetX = element.offsetLeft - e.clientX + element.clientWidth / 2;
    offsetY = element.offsetTop - e.clientY + eHeight / 2;
    //handle.ontouchmove = dragElement;
    handle.addEventListener('touchmove', dragElement, { passive: false });
    handle.setPointerCapture(e.pointerId);
}

function dragElement(e) {
    let coords = e.targetTouches[0];
    if (coords.pageY >= 0 && coords.pageY <= window.innerHeight - 35) element.style.top = coords.pageY + offsetY + "px";
    if (coords.pageX >= 5 && coords.pageX <= window.innerWidth - 20) element.style.left = coords.pageX + offsetX + "px";
    element.style.maxHeight = 'calc(100% - ' + element.style.top + ')';
}

function clearDragEvents(e) {
    handle.removeEventListener('touchmove', dragElement);
    handle.releasePointerCapture(e.pointerId);
}

function addCSS() {
    let style = document.createElement("style");
    style.textContent = `
    .grab {
        margin-top: -0.5em;
        text-shadow:
            0 5px white,
            0 10px white,
            5px 0 white,
            5px 5px white,
            5px 10px white;
        padding: 0 0.5em;
        padding-left: 0.75em;
        display: flex;
        flex-flow: wrap;
        align-content: center;
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 2em;
    }
    `
    document.head.appendChild(style);
    cssAdded = true;
}
