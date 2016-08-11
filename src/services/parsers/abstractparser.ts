import * as si from '../../shared/interfaces';
import * as request from 'request';
import {IncomingMessage} from 'http';
import * as iconv from 'iconv';
import * as sax from 'sax';

export abstract class AbstractParser {

    protected parser = new sax.SAXParser(true, {
        trim: true,
        normalize: true
    });
    protected current_tag: any;
    protected error: any;
    protected article: any;

    constructor(private callback: (articleBody: si.IBodyContainer) => void, protected uuid = '') {
        this.parser.onopentag = (tag) => {
            this.openTag(tag);
        };
        this.parser.onclosetag = (tag) => {
            this.closeTag(tag);
        };

        this.parser.onerror = () => {
            this.error = undefined;
        }
        this.parser.ontext = (text) => {
            this.onText(text);
        };
        this.parser.oncdata = (text) => {
            this.onText(text);
        };
        this.parser.onend = () => {
            this.onEnd();
        };
    }

    protected abstract openTag(tag: any): void;
    protected abstract closeTag(tag: any): void;
    protected abstract onText(text: string): void;
    protected abstract onEnd() : void;
            
    abstract parseArticle(article: si.IArticleContainer) : void;

    protected getArticle(url: string, callback:(document: string) => void , encoding = null): void {
        request.get(url, {
            encoding: null
        }, (err: Error, resp: IncomingMessage, data: Buffer) => {
            if (!err) {
                let converted = data;
                if (encoding) {                    
                    let encoder = new iconv.Iconv(encoding, 'utf8');
                    converted = encoder.convert(data);
                }                
                callback(converted.toString());
            } else {
                callback(null);
            }
        });
    }
    protected getBinaryContent(url: string, callback: (data: Buffer) => void): void {
        request.get(url, {
            encoding: null
        }, (err: Error, resp: IncomingMessage, data: Buffer) => {
            if (!err) {
                callback(data);
            } else {
                callback(null);
            }
        });
    }

    protected scrubHtml(html: string): string {
        return html.replace(/<script.*<\/script>/gi, '');
    }

    protected childByName(parent, name) {
        let children = parent.children || [];
        for (let i = 0; i < children.length; i++) {
            if (children[i].name === name) {
                return children[i];
            }
        }
        return null;
    }

    protected childrenByName(parent, name) {
        let children = parent.children || [];
        let result = [];
        for (let i = 0; i < children.length; i++) {
            if (children[i].name === name) {
                result.push(children[i]);
            }
        }
        return result;
    }
    

    protected childData(parent: any, name: string, separator = ''): string {
        let node = this.childByName(parent, name);
        if (!node) {
            return '';
        }
        let children = node.children;
        if (!children.length) {
            return '';
        }
        return children.join(separator);
    }
}