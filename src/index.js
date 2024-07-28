import {domEvents} from "./domEvents.js";
import {attributes} from "./attributes.js";
import createObservableObject from "./createObservableObject.js";
import checkProperty from "./checkProperty.js";

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

    function updateDom (node) {
        node.querySelectorAll(`[${attributes.TEXT}]`).forEach(element => {
            console.log(element)
            const expression = element.getAttribute(attributes.TEXT);
            const parentScope = getScope(node);
            const closestScope = getScope(element);

            let scope;
            if (checkProperty(closestScope, expression)) {
                scope = closestScope
            } else if (checkProperty(parentScope, expression)) {
                scope = parentScope
            } else {
                return
            }

            updateText(element, expression, scope);
        });
    }

    function processNode(node) {
        if (!node.hasAttribute(attributes.SCOPE)) return
        let scope = {};

        scope = evaluate(node, node.getAttribute(attributes.SCOPE));
        node.__i_scope = createObservableObject(scope, (change) => {
            updateDom(node);
        });
        updateDom(node);
    }

    function getScope(element) {
        if (element.__i_scope)
            return element.__i_scope
        return element.closest(`[${attributes.SCOPE}]`).__i_scope
    }

    document.querySelectorAll(`[${attributes.SCOPE}]`).forEach(el => {
        processNode(el)
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
