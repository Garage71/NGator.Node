"use strict";
const request = require('request');
class BinaryProvider {
    static getBinaryData(url, callback) {
        request.get(url, {
            encoding: null
        }, (err, resp, data) => {
            if (!err) {
                callback(data);
            }
            else {
                callback(null);
            }
        });
    }
}
exports.BinaryProvider = BinaryProvider;
//# sourceMappingURL=binaryprovider.js.map