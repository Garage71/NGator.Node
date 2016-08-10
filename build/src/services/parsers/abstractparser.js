"use strict";
const request = require('request');
const iconv = require('iconv');
const sax = require('sax');
class AbstractParser {
    constructor(callback) {
        this.callback = callback;
        this.parser = new sax.SAXParser(true, {
            trim: true,
            normalize: true
        });
    }
    getArticle(url, callback, encoding = null) {
        request.get(url, {
            encoding: null
        }, (err, resp, data) => {
            if (!err) {
                let converted = data;
                if (encoding) {
                    let encoder = new iconv.Iconv(encoding, 'utf8');
                    converted = encoder.convert(data);
                }
                callback(converted.toString());
            }
            else {
                callback(null);
            }
        });
    }
    getBinaryContent(url, callback) {
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
    scrubHtml(html) {
        return html.replace(/<script.*<\/script>/gi, '');
    }
    childByName(parent, name) {
        let children = parent.children || [];
        for (let i = 0; i < children.length; i++) {
            if (children[i].name === name) {
                return children[i];
            }
        }
        return null;
    }
    childrenByName(parent, name) {
        let children = parent.children || [];
        let result = [];
        for (let i = 0; i < children.length; i++) {
            if (children[i].name === name) {
                result.push(children[i]);
            }
        }
        return result;
    }
    childData(parent, name, separator = '') {
        let node = this.childByName(parent, name);
        if (!node) {
            return '';
        }
        let children = node.children;
        if (!children.length) {
            return '';
        }
        return children.join(separator);
    }
}
exports.AbstractParser = AbstractParser;
//# sourceMappingURL=abstractparser.js.map