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

export function loadJSON(url) {
    return new Promise((resolve, reject) => {
        const xhttp = new XMLHttpRequest();
        xhttp.onload = (data) => {
            resolve(JSON.parse(data.currentTarget.response));
        }
        xhttp.open('GET', url, false);
        xhttp.send();
        xhttp.onerror = () => {
            console.log("Error: Could not load JSON at '"+ url +"'");
            reject(false);
        }
    });
}