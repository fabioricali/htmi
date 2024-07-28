(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
})((function () { 'use strict';

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

    function createObservableObject(obj, callback) {
        function isObject(val) {
            return val !== null && typeof val === 'object';
        }

        function createHandler(path = []) {
            return {
                get(target, property, receiver) {
                    const value = Reflect.get(target, property, receiver);
                    if (isObject(value)) {
                        return new Proxy(value, createHandler(path.concat(property)));
                    }
                    return value;
                },
                set(target, property, value, receiver) {
                    const oldValue = target[property];
                    const success = Reflect.set(target, property, value, receiver);
                    if (success && oldValue !== value) {
                        callback({
                            type: 'set',
                            target,
                            property,
                            oldValue,
                            newValue: value,
                            path: path.concat(property).join('.')
                        });
                    }
                    return success;
                },
                deleteProperty(target, property) {
                    const oldValue = target[property];
                    const success = Reflect.deleteProperty(target, property);
                    if (success) {
                        callback({
                            type: 'delete',
                            target,
                            property,
                            oldValue,
                            path: path.concat(property).join('.')
                        });
                    }
                    return success;
                }
            };
        }

        return new Proxy(obj, createHandler());
    }

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
                    console.log('scope not found', 'expression', expression);
                    return
                    //scope = closestScope
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
            node.__x_scope = createObservableObject(scope, (change) => {
                console.log(change);
                updateDom(node);
            });  // Store scope in node for later use
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
                const scope = getScope(element);

                element.addEventListener(eventName, () => {
                    evaluate(scope, expression);
                });
            });
        });
    });

}));
