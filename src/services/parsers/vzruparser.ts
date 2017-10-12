/**
*    VZ.ru article parser implementation
*/

import {AbstractParser} from './abstractparser';
import * as si from '../../shared/interfaces';

export class VzRuParser extends AbstractParser {

    private cbSent = false;
    constructor(private cb: (articleBody: si.IBodyContainer) => void, private articleId: string = '') {
        super(cb, articleId);
    }
    protected onopentag(tag: any): void {
        if (tag.name === 'div') {
            if (tag.attributes) {
                let attr = tag.attributes['class'];
                if (attr && attr.toString().includes('text newtext')) {
                    this.article = tag;
                }
            }
        }
    }

    protected onclosetag(tagname: string, currentTag: any): void {
        if (tagname === 'div' && currentTag === this.article) {
            let paragraphs = this.childrenByName(this.article, 'p');
            let articleText = '';
            for (let p of paragraphs) {
                for (let child of p.children) {
                    if (typeof child === 'string') {
                        articleText = articleText + ' ' + child;
                    } else {
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