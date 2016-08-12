
import {AbstractParser} from './abstractparser';
import * as si from '../../shared/interfaces';
import * as sax from 'sax';

export class LentaParser extends AbstractParser {

    constructor(private cb: (articleBody: si.IBodyContainer) => void) {
        super(cb);
        
    }
    
    protected  onopentag(tag) {
        if (tag.name === 'div') {
            if (tag.attributes) {
                let attr = tag.attributes['itemprop'];
                if (attr && attr.toString().includes('articleBody')) {
                    this.article = tag;
                }
            }
        }
    }

    protected onclosetag(tagname, currentTag) {
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
} 