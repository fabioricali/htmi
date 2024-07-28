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

export default createObservableObject