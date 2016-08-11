"use strict";
const abstractparser_1 = require('./abstractparser');
class LentaParser extends abstractparser_1.AbstractParser {
    constructor(cb) {
        super(cb);
        this.cb = cb;
    }
    parseArticle(article) {
        this.getArticle(article.header.link, (document) => {
            this.parser.write(document);
        });
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
            let p = this.current_tag.parent;
            delete this.current_tag.parent;
            this.current_tag = p;
        }
    }
    onText(text) {
        if (this.current_tag) {
            this.current_tag.children.push(text);
        }
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
    onEnd() {
    }
}
exports.LentaParser = LentaParser;
//# sourceMappingURL=lentaparser.js.map