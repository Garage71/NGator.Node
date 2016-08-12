﻿
import {AbstractParser} from './abstractparser';
import * as si from '../../shared/interfaces';
import {Helper} from '../helper';

export class VzRuParser extends AbstractParser {

    private cbSent = false;
    constructor(private cb: (articleBody: si.IBodyContainer) => void, private articleId = '') {
        super(cb, articleId);
    }
    protected onopentag(tag) {
        if (tag.name === 'div') {
            if (tag.attributes) {
                let attr = tag.attributes['class'];
                if (attr && attr.toString().includes('text')) {
                    this.article = tag;
                }
            }
        }
    }

    protected onclosetag(tagname, currentTag) {
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