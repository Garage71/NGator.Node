/**
* Regnum article parser implementation
*/

import {AbstractParser} from './abstractparser';
import * as si from '../../shared/interfaces';
import {BinaryProvider} from '../binaryprovider';
import {ContentStorage} from '../contentstorage';

export class RegnumParser extends AbstractParser {
    private cbSent = false;
    private illustration: any;
    private illustrationUrl: string;
    private articleText: string;
    constructor(private cb: (articleBody: si.IBodyContainer) => void, private articleId: string = '') {
        super(cb, articleId);
    }
    protected onopentag(tag: any): void {
        if (tag.name === 'div') {
            if (tag.attributes) {
                let attr = tag.attributes['class'];
                if (attr && attr.toString().includes('news_body')) {
                    this.article = tag;
                }
            }
        } else if (tag.name === 'img') {
            if (tag.attributes) {
                let imgClass = tag.attributes['class'];
                if (imgClass === 'detail_img') {
                    this.illustration = tag;
                }
            }
        }
    }

    protected onclosetag(tagname: string, currentTag: any): void {
        if (tagname === 'div' && currentTag === this.article) {
            if (!this.articleText) {
                let paragraphs = this.childrenByName(this.article, 'p');
                let articleText = '';
                for (let p of paragraphs) {
                    for (let child of p.children) {
                        if (typeof child === 'string') {
                            articleText = articleText + ' ' + child;
                        } else {
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
                    BinaryProvider.GETBINARYDATA(url,
                        (data: Buffer) => {
                            ContentStorage.saveEnclosure(this.uuid, data);
                            if (!this.cbSent) {
                                this.cb({
                                    body: this.articleText,
                                    hasPicture: true
                                });
                                this.cbSent = true;
                            }
                        });
                }
            } else {
                if (!this.cbSent) {
                    this.cb({
                        body: this.articleText,
                        hasPicture: false
                    });
                    this.cbSent = true;
                }
            }
        } else if (tagname === 'img' && currentTag === this.illustration) {
            this.illustrationUrl = currentTag.attributes['src'];
        }
    }
}