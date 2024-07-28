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

    function updateDom (node, scope) {
        node.querySelectorAll(`[${attributes.TEXT}]`).forEach(element => {
            if (getScope(node) !== getScope(element)) return;
            const expression = element.getAttribute(attributes.TEXT);
            updateText(element, expression, scope);
        });
    }

    function processNode(node) {
        let scope = {};

        if (node.hasAttribute(attributes.SCOPE)) {
            scope = evaluate(node, node.getAttribute(attributes.SCOPE));
            node.__x_scope = scope;  // Store scope in node for later use
            updateDom(node, scope);
        }
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
                evaluate(scope, expression);
                updateDom(node, scope);  // Update DOM after state change
            });
        });
    });
});
