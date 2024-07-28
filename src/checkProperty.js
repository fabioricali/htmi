function checkProperty(obj, path) {
    const properties = path.split('.');

    function check(obj, index) {
        if (index === properties.length) {
            return true;
        }

        if (!obj || !obj.hasOwnProperty(properties[index])) {
            return false;
        }

        return check(obj[properties[index]], index + 1);
    }

    return check(obj, 0);
}

export default checkProperty