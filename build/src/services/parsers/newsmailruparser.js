"use strict";
const abstractparser_1 = require('./abstractparser');
const binaryprovider_1 = require('../binaryprovider');
const contentstorage_1 = require('../contentstorage');
class NewsMailRuParser extends abstractparser_1.AbstractParser {
    constructor(cb, articleId = '') {
        super(cb, articleId);
        this.cb = cb;
        this.articleId = articleId;
    }
    onopentag(tag) {
        if (tag.name === 'div') {
            if (tag.attributes) {
                let attr = tag.attributes['class'];
                if (attr && attr.toString().includes('article__text js-module js-mediator-article')) {
                    this.article = tag;
                }
            }
        }
    }
    onclosetag(tagname, currentTag) {
        if (tagname === 'div' && currentTag === this.article) {
            let textNode = this.getDescendantByAttributes(currentTag, 'div', 'class', 'article__item_html');
            if (textNode) {
                let articleText = '';
                let paragraphs = this.childrenByName(textNode, 'p');
                for (let p of paragraphs) {
                    for (let child of p.children) {
                        if (typeof child === 'string') {
                            articleText = articleText + ' ' + child.replace('&nbsp', ' ');
                        }
                        else {
                            if (child.children.length > 0) {
                                articleText = articleText + ' ' + child.children[0].replace('&nbsp', ' ');
                            }
                        }
                    }
                }
                let pictNode = this.getDescendantByAttributes(currentTag, 'img', 'class', 'photo__pic');
                if (pictNode && pictNode.attributes) {
                    let url = pictNode.attributes['src'];
                    if (url && this.uuid) {
                        binaryprovider_1.BinaryProvider.getBinaryData(url, (data) => {
                            contentstorage_1.ContentStorage.saveEnclosure(this.uuid, data);
                            this.cb({
                                body: articleText,
                                hasPicture: true
                            });
                        });
                    }
                }
                else {
                    this.cb({
                        body: articleText,
                        hasPicture: false
                    });
                }
            }
        }
    }
}
exports.NewsMailRuParser = NewsMailRuParser;
//# sourceMappingURL=newsmailruparser.js.map