/**
 *
 * Base news parser class. Built on SAX
 *
 */
"use strict";
const request = require('request');
const iconv = require('iconv');
const sax = require('sax');
class AbstractParser {
    constructor(callback, uuid = '') {
        this.callback = callback;
        this.uuid = uuid;
        this.parser = new sax.SAXParser(true, {
            trim: true,
            normalize: true
        });
        this.parser.onopentag = (tag) => {
            this.openTag(tag);
        };
        this.parser.onclosetag = (tag) => {
            this.closeTag(tag);
        };
        this.parser.onerror = () => {
            this.error = undefined;
        };
        this.parser.ontext = (text) => {
            this.onText(text);
        };
        this.parser.oncdata = (text) => {
            this.onText(text);
        };
        this.parser.onend = () => {
            this.onEnd();
        };
    }
    getArticle(url, callback, encoding = null) {
        request.get(url, {
            encoding: null
        }, (err, resp, data) => {
            if (!err) {
                let converted = data;
                if (encoding) {
                    const encoder = new iconv.Iconv(encoding, 'utf8');
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
        const children = parent.children || [];
        for (let i = 0; i < children.length; i++) {
            if (children[i].name === name) {
                return children[i];
            }
        }
        return null;
    }
    childrenByName(parent, name) {
        const children = parent.children || [];
        const result = [];
        for (let i = 0; i < children.length; i++) {
            if (children[i].name === name) {
                result.push(children[i]);
            }
        }
        return result;
    }
    childData(parent, name, separator = '') {
        const node = this.childByName(parent, name);
        if (!node) {
            return '';
        }
        const children = node.children;
        if (!children.length) {
            return '';
        }
        return children.join(separator);
    }
    parseArticle(article, encoding) {
        this.getArticle(article.header.link, (document) => {
            this.parser.write(document);
        }, encoding);
    }
    write(xml) {
        this.parser.write(xml).close();
    }
    ;
    openTag(tag) {
        tag.parent = this.current_tag;
        tag.children = [];
        if (tag.parent) {
            tag.parent.children.push(tag);
        }
        this.current_tag = tag;
        this.onopentag(tag);
    }
    closeTag(tagname) {
        this.onclosetag(tagname, this.current_tag);
        if (this.current_tag && this.current_tag.parent) {
            const p = this.current_tag.parent;
            delete this.current_tag.parent;
            this.current_tag = p;
        }
    }
    onText(text) {
        if (this.current_tag) {
            this.current_tag.children.push(text);
        }
    }
    onEnd() {
    }
    getDescendantByAttributes(node, name, attribute, value) {
        if (node.name === name && node.attributes) {
            let attr = node.attributes[attribute];
            if (attr && attr.toString().includes(value)) {
                return node;
            }
        }
        if (node.children) {
            for (let childNode of node.children) {
                let result = this.getDescendantByAttributes(childNode, name, attribute, value);
                if (result !== null) {
                    return result;
                }
            }
        }
        return null;
    }
}
exports.AbstractParser = AbstractParser;

//# sourceMappingURL=abstractparser.js.map
