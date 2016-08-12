"use strict";
const abstractparser_1 = require('./abstractparser');
class VzRuParser extends abstractparser_1.AbstractParser {
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
                if (attr && attr.toString().includes('text')) {
                    this.article = tag;
                }
            }
        }
    }
    onclosetag(tagname, currentTag) {
        if (tagname === 'div' && currentTag === this.article) {
            let paragraphs = this.childrenByName(this.article, 'p');
            let articleText = '';
            for (let p of paragraphs) {
                for (let child of p.children) {
                    if (typeof child === 'string') {
                        articleText = articleText + ' ' + child;
                    }
                    else {
                        if (child.children[0].length > 0) {
                            articleText = articleText + ' ' + child.children[0];
                        }
                    }
                }
            }
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
exports.VzRuParser = VzRuParser;

//# sourceMappingURL=vzruparser.js.map
