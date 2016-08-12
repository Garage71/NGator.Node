"use strict";
const abstractparser_1 = require('./abstractparser');
const binaryprovider_1 = require('../binaryprovider');
const contentstorage_1 = require('../contentstorage');
class RegnumParser extends abstractparser_1.AbstractParser {
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
                if (attr && attr.toString().includes('news_body')) {
                    this.article = tag;
                }
            }
        }
        else if (tag.name === 'img') {
            if (tag.attributes) {
                let imgClass = tag.attributes['class'];
                if (imgClass === 'detail_img') {
                    this.illustration = tag;
                }
            }
        }
    }
    onclosetag(tagname, currentTag) {
        if (tagname === 'div' && currentTag === this.article) {
            if (!this.articleText) {
                let paragraphs = this.childrenByName(this.article, 'p');
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
                this.articleText = articleText;
            }
            let pictNode = this.getDescendantByAttributes(currentTag, 'img', 'class', 'main_image');
            if (this.illustrationUrl || (pictNode && pictNode.attributes)) {
                let url = this.illustrationUrl || pictNode.attributes['src'];
                if (url && this.uuid) {
                    binaryprovider_1.BinaryProvider.GETBINARYDATA(url, (data) => {
                        contentstorage_1.ContentStorage.saveEnclosure(this.uuid, data);
                        if (!this.cbSent) {
                            this.cb({
                                body: this.articleText,
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
                        body: this.articleText,
                        hasPicture: false
                    });
                    this.cbSent = true;
                }
            }
        }
        else if (tagname === 'img' && currentTag === this.illustration) {
            this.illustrationUrl = currentTag.attributes['src'];
        }
    }
}
exports.RegnumParser = RegnumParser;
//# sourceMappingURL=regnumparser.js.map