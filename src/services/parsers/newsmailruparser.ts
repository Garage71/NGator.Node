﻿/**
* News.mail.ru article parser implementations
*/

import {AbstractParser} from './abstractparser';
import * as si from '../../shared/interfaces';
import {BinaryProvider} from '../binaryprovider';
import {ContentStorage} from '../contentstorage';

export class NewsMailRuParser extends AbstractParser {
    constructor(private cb: (articleBody: si.IBodyContainer) => void, private articleId: string = '') {
        super(cb, articleId);
    }

    protected onopentag(tag: any): void {
        if (tag.name === 'div') {
            if (tag.attributes) {
                let attr = tag.attributes['class'];
                if (attr && attr.toString().includes('article__text js-module js-view js-mediator-article')) {
                    this.article = tag;
                }
            }
        }
    }

    protected onclosetag(tagname: string, currentTag: any): void {
        if (tagname === 'div' && currentTag === this.article) {
            let textNode = this.getDescendantByAttributes(currentTag, 'div', 'class', 'article__item_html');
            if (textNode) {
                let articleText = '';
                let paragraphs = this.childrenByName(textNode, 'p');
                let spans = this.childrenByName(textNode, 'span');
                paragraphs.concat(spans);
                for (let p of paragraphs) {
                    for (let child of p.children) {
                        if (typeof child === 'string') {
                            articleText = articleText + ' ' + child.replace('&nbsp', ' ');
                        } else {
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
                        BinaryProvider.GETBINARYDATA(url,
                        (data: Buffer) => {
                            ContentStorage.saveEnclosure(this.uuid, data);
                            this.cb({
                                body: articleText,
                                hasPicture: true
                            });
                        });
                    }
                } else {
                    this.cb({
                        body: articleText,
                        hasPicture: false
                    });
                }
            }
        }
    }
}