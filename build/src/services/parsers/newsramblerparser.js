"use strict";
const abstractparser_1 = require('./abstractparser');
const binaryprovider_1 = require('../binaryprovider');
const contentstorage_1 = require('../contentstorage');
class NewsRamblerRuParser extends abstractparser_1.AbstractParser {
    constructor(cb, articleId = '') {
        super(cb, articleId);
        this.cb = cb;
        this.articleId = articleId;
        this.cbSent = false;
    }
    onopentag(tag) {
        if (tag.name === 'div') {
            if (tag.attributes) {
                let attr = tag.attributes['class'];
                if (attr && attr.toString().includes('article__column')) {
                    this.article = tag;
                }
            }
        }
    }
    onclosetag(tagname, currentTag) {
        if (tagname === 'div' && currentTag === this.article) {
            let paragraphs = this.childrenByName(this.article, 'div');
            paragraphs = paragraphs.filter((p) => {
                if (p.attributes) {
                    let cls = p.attributes['class'];
                    if (cls === 'article__paragraph') {
                        return true;
                    }
                }
                return false;
            });
            let articleText = '';
            for (let p of paragraphs) {
                for (let child of p.children) {
                    if (typeof child === 'string') {
                        articleText = articleText + ' ' + child;
                    }
                    else {
                        if (child.children.length > 0) {
                            let firstInnerChild = child.children[0];
                            if (typeof firstInnerChild === 'string') {
                                articleText = articleText + ' ' + firstInnerChild;
                            }
                        }
                    }
                }
            }
            let pictNode = this.getDescendantByAttributes(currentTag, 'img', 'class', 'article__image');
            if (pictNode && pictNode.attributes) {
                let url = pictNode.attributes['src'];
                if (url && this.uuid) {
                    binaryprovider_1.BinaryProvider.getBinaryData(url, (data) => {
                        contentstorage_1.ContentStorage.saveEnclosure(this.uuid, data);
                        if (!this.cbSent) {
                            this.cb({
                                body: articleText,
                                hasPicture: true
                            });
                            this.cbSent = true;
                        }
                    });
                }
            }
            else {
                if (!this.cbSent) {
                    this.cb({
                        body: articleText,
                        hasPicture: false
                    });
                    this.cbSent = true;
                }
            }
        }
    }
}
exports.NewsRamblerRuParser = NewsRamblerRuParser;
//# sourceMappingURL=newsramblerparser.js.map