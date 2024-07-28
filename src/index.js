import {domEvents} from "./domEvents.js";


document.addEventListener('DOMContentLoaded', () => {


    const evaluate = (scope, expression) => {
        try {
            return new Function('with(this) { return ' + expression + ' }').call(scope);
        } catch (error) {
            console.error(`Error evaluating expression: ${expression}`, error);
        }
    };

    const updateText = (element, expression, scope) => {
        element.innerText = evaluate(scope, expression);
    };

    const updateDom = (node, scope) => {
        node.querySelectorAll('[x-text]').forEach(element => {
            if (node !== element.__x_scopeEl) return;
            const expression = element.getAttribute('x-text');
            updateText(element, expression, scope);
        });
    };

    function processNode(node) {
        let scope = {};

        if (node.hasAttribute('x-data')) {
            scope = evaluate(node, node.getAttribute('x-data'));
            node.__x_data = scope;  // Store scope in node for later use
        } else if (node.__x_data) {
            scope = node.__x_data;
        }

        updateDom(node, scope);
    }

    document.querySelectorAll('[x-text]').forEach(element => {
        element.__x_scopeEl = element.closest('[x-data]');
    });

    document.querySelectorAll('[x-data]').forEach(el => {
        processNode(el)
    });

    domEvents.forEach(eventName => {
        document.querySelectorAll(`[x-on\\:${eventName}]`).forEach(element => {
            if (!element.__x_event_attached) {  // Ensure event is attached only once
                const expression = element.getAttribute(`x-on:${eventName}`);
                const closestNode = element.closest('[x-data]');
                const closestScope = closestNode.__x_data;

                element.addEventListener(eventName, () => {
                    evaluate(closestScope, expression);
                    updateDom(closestNode, closestScope);  // Update DOM after state change
                });
                element.__x_event_attached = true;  // Mark event as attached
            }
        });
    });
});
