"use strict";
const abstractparser_1 = require('./abstractparser');
class LentaParser extends abstractparser_1.AbstractParser {
    constructor(cb) {
        super(cb);
        this.cb = cb;
    }
    onopentag(tag) {
        if (tag.name === 'div') {
            if (tag.attributes) {
                let attr = tag.attributes['itemprop'];
                if (attr && attr.toString().includes('articleBody')) {
                    this.article = tag;
                }
            }
        }
    }
    onclosetag(tagname, currentTag) {
        if (tagname === 'div' && currentTag === this.article) {
            let articleText = '';
            let paragraphs = this.childrenByName(this.article, 'p');
            for (let p of paragraphs) {
                for (let child of p.children) {
                    if (typeof child === 'string') {
                        articleText = articleText + ' ' + child;
                    }
                    else {
                        articleText = articleText + ' ' + child.children[0];
                    }
                }
            }
            this.cb({
                body: articleText,
                hasPicture: true
            });
        }
    }
}
exports.LentaParser = LentaParser;

//# sourceMappingURL=lentaparser.js.map
