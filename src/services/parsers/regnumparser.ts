import {AbstractParser} from './abstractparser';
import * as si from '../../shared/interfaces';
import {BinaryProvider} from '../binaryprovider';
import {ContentStorage} from '../contentstorage';

export class RegnumParser extends AbstractParser {
    private cbSent = false;
    constructor(private cb: (articleBody: si.IBodyContainer) => void, private articleId = '') {
        super(cb, articleId);
    }
    protected onopentag(tag) {
        if (tag.name === 'div') {
            if (tag.attributes) {
                let attr = tag.attributes['class'];
                if (attr && attr.toString().includes('news_body')) {
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
                        if (child.children.length > 0) {
                            let firstInnerChild = child.children[0];
                            if (typeof firstInnerChild === 'string') {
                                articleText = articleText + ' ' + firstInnerChild;
                            }
                        }
                    }
                }
            }
            let pictNode = this.getDescendantByAttributes(currentTag, 'img', 'class', 'main_image');
            if (pictNode && pictNode.attributes) {
                let url = pictNode.attributes['src'];
                if (url && this.uuid) {
                    BinaryProvider.getBinaryData(url,
                        (data: Buffer) => {
                            ContentStorage.saveEnclosure(this.uuid, data);
                            if(!this.cbSent) {
                                this.cb({
                                    body: articleText,
                                    hasPicture: true
                                });
                                this.cbSent = true;
                            }
                        });
                }
            } else {
                if(!this.cbSent) {
                    this.cb({
                        body: articleText,
                        hasPicture: false
                    });
                    this.cbSent = true;
                }
            }
        }
    }
}