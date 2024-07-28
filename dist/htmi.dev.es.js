const domEvents= [
    "abort", "afterprint", "animationend", "animationiteration", "animationstart",
    "beforeprint", "beforeunload", "blur", "canplay", "canplaythrough", "change",
    "click", "contextmenu", "copy", "cut", "dblclick", "drag", "dragend", "dragenter",
    "dragexit", "dragleave", "dragover", "dragstart", "drop", "durationchange", "ended",
    "error", "focus", "focusin", "focusout", "fullscreenchange", "fullscreenerror", "input",
    "invalid", "keydown", "keypress", "keyup", "load", "loadeddata", "loadedmetadata",
    "loadstart", "message", "mousedown", "mouseenter", "mouseleave", "mousemove", "mouseover",
    "mouseout", "mouseup", "offline", "online", "open", "pagehide", "pageshow", "paste",
    "pause", "play", "playing", "popstate", "progress", "ratechange", "resize", "reset",
    "scroll", "search", "seeked", "seeking", "select", "show", "stalled", "submit", "suspend",
    "timeupdate", "toggle", "touchcancel", "touchend", "touchmove", "touchstart", "transitionend",
    "unload", "volumechange", "waiting", "wheel"
];

const attributes = {
    SCOPE: 'i-scope',
    TEXT: 'i-text',
    ON: 'i-on'
};

document.addEventListener('DOMContentLoaded', () => {

    function evaluate (scope, expression) {
        try {
            return new Function('with(this) { return ' + expression + ' }').call(scope);
        } catch (error) {
            console.error(`Error evaluating expression: ${expression}`, error);
        }
    }

    function updateText (element, expression, scope) {
        element.innerText = evaluate(scope, expression);
    }

    function updateDom (node, result) {
        node.querySelectorAll(`[${attributes.TEXT}]`).forEach(element => {
            const expression = element.getAttribute(attributes.TEXT);
            const parentScope = getScope(node);
            const closestScope = getScope(element);

            let scope;
            if (typeof closestScope?.[expression] !== "undefined") {
                // console.log('a')
                scope = closestScope;
            } else if (typeof parentScope?.[expression] !== "undefined") {
                // console.log('b')
                scope = parentScope;
            } else {
                return
            }
            // console.log(scope)
            // console.log(expression)
            updateText(element, expression, scope);
        });
    }

    function processNode(node) {
        if (!node.hasAttribute(attributes.SCOPE)) return
        let scope = {};

        scope = evaluate(node, node.getAttribute(attributes.SCOPE));
        node.__x_scope = scope;  // Store scope in node for later use
        updateDom(node);
    }

    function getScope(element) {
        if (element.__x_scope)
            return element.__x_scope
        return element.closest(`[${attributes.SCOPE}]`).__x_scope
    }

    document.querySelectorAll(`[${attributes.SCOPE}]`).forEach(el => {
        processNode(el);
    });

    // init events
    domEvents.forEach(eventName => {
        document.querySelectorAll(`[${attributes.ON}\\:${eventName}]`).forEach(element => {
            const expression = element.getAttribute(`${attributes.ON}:${eventName}`);
            const node = element.closest(`[${attributes.SCOPE}]`);
            const scope = getScope(element);

            element.addEventListener(eventName, () => {
                // console.log('dddddddddddddddddddddddddd', expression)
                evaluate(scope, expression);
                // console.log('result', result)
                updateDom(node);  // Update DOM after state change
            });
        });
    });
});
