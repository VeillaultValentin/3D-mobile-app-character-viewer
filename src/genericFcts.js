export function onPropertyChange(o, callback) {
    for (let p in o) {
        if (o.hasOwnProperty(p)) {
            let originalVal = o[p];
            Object.defineProperty(o, p, {
                get: function () {
                    return originalVal;
                },
                set: function (val) {
                    callback.call(o, p, val);
                    return originalVal = val;
                }
            });
        }
    }
}

export function trackPointer(event, pointerVector) {
    pointerVector.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointerVector.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
