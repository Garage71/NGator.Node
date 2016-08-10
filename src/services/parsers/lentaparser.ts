
import {AbstractParser} from './abstractparser';
import * as si from '../../shared/interfaces';
import * as sax from 'sax';

export class LentaParser extends AbstractParser {

    constructor(private cb: (articleBody: si.IBodyContainer) => void) {
        super(cb);
        this.parser.onopentag = (tag) => {
            this.open(tag);
        };
        this.parser.onclosetag = (tag) => {
            this.close(tag);
        };

        this.parser.onerror = () => {
            this.error = undefined;
        }
        this.parser.ontext = (text) => {
            this.ontext(text);
        };
        this.parser.oncdata = (text) => {
            this.ontext(text);
        };
        this.parser.onend = () => {
            this.onend();
        };        
    }
    parseArticle(article: si.IArticleContainer): void {
        this.getArticle(article.header.link,
        (document) => {
            this.parser.write(document);
        });
    }

    write(xml: string) {
        this.parser.write(xml).close();
    };

    private open(tag) {
        tag.parent = this.current_tag;
        tag.children = [];
        if (tag.parent) {
            tag.parent.children.push(tag);
        }
        this.current_tag = tag;
        this.onopentag(tag);
    }

    private close(tagname) {
        this.onclosetag(tagname, this.current_tag);
        if (this.current_tag && this.current_tag.parent) {
            let p = this.current_tag.parent;
            delete this.current_tag.parent;
            this.current_tag = p;
        }
    }

    private ontext(text) {
        if (this.current_tag) {
            this.current_tag.children.push(text);
        }
    }

    private onopentag(tag) {
        if (tag.name === 'div') {
            if (tag.attributes) {
                let attr = tag.attributes['itemprop'];
                if (attr && attr.toString().includes('articleBody')) {
                    this.article = tag;
                }
            }
        }
    }

    private onclosetag(tagname, currentTag) {
        if (tagname === 'div' && currentTag === this.article) {
            let articleText = '';
            let paragraphs = this.childrenByName(this.article, 'p');
            for (let p of paragraphs) {
                for (let child of p.children) {
                    if (typeof child === 'string') {
                        articleText = articleText + ' ' + child;
                    } else {
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

    private onend() {

    }
} 