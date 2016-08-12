/**
 *
 * Base news parser class. Built on SAX
 *
 */

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
    protected currentTag: any;
    protected error: any;
    protected article: any;

    constructor(private callback: (articleBody: si.IBodyContainer) => void, protected uuid: string = '') {
        this.parser.onopentag = (tag) => {
            this.openTag(tag);
        };
        this.parser.onclosetag = (tag) => {
            this.closeTag(tag);
        };

        this.parser.onerror = () => {
            this.error = undefined;
        };
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

    protected getArticle(url: string, callback: (document: string) => void, encoding: string = null): void {
        request.get(url, {
            encoding: null
        },
        (err: Error, resp: IncomingMessage, data: Buffer) => {
            if (!err) {
                let converted = data;
                if (encoding) {
                    const encoder = new iconv.Iconv(encoding, 'utf8');
                    converted = encoder.convert(data);
                }
                callback(converted.toString());
            } else {
                callback(null);
            }
        });
    }

    protected getBinaryContent(url: string, callback: (data: Buffer) => void): void {
        request.get(url,
        {
            encoding: null
        },
        (err: Error, resp: IncomingMessage, data: Buffer) => {
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

    protected childByName(parent: any, name: string): any {
        const children = parent.children || [];
        for (let child of children) {
            if (child.name === name) {
                return child;
            }
        }
        return null;
    }

    protected childrenByName(parent: any, name: string): any {
        const children = parent.children || [];
        const result = [];
        for (let child of children) {
            if (child.name === name) {
                result.push(child);
            }
        }
        return result;
    }


    protected childData(parent: any, name: string, separator: string = ''): string {
        const node = this.childByName(parent, name);
        if (!node) {
            return '';
        }
        const children = node.children;
        if (!children.length) {
            return '';
        }
        return children.join(separator);
    }

    parseArticle(article: si.IArticleContainer, encoding: any): void {
            this.getArticle(article.header.link,
                (document) => {
                    this.parser.write(document);
                },
                encoding);
    }

    write(xml: string): void {
        this.parser.write(xml).close();
    };

    protected openTag(tag: any): void {
        tag.parent = this.currentTag;
        tag.children = [];
        if (tag.parent) {
            tag.parent.children.push(tag);
        }
        this.currentTag = tag;
        this.onopentag(tag);
    }

    protected closeTag(tagname: string): void {
        this.onclosetag(tagname, this.currentTag);
        if (this.currentTag && this.currentTag.parent) {
            const p = this.currentTag.parent;
            delete this.currentTag.parent;
            this.currentTag = p;
        }
    }

    protected onText(text: string): void {
        if (this.currentTag) {
            this.currentTag.children.push(text);
        }
    }

    protected onEnd(): void {
        return;
    }

    protected abstract onopentag(tag: any): void;

    protected abstract onclosetag(tagname: string, currentTag: any): void;

    protected getDescendantByAttributes(node: any, name: string, attribute: string, value: string): any {
        if (node.name === name && node.attributes) {
            let attr = node.attributes[attribute];
            if (attr && attr.toString().includes(value)) {
                return node;
            }
        }
        if (node.children) {
            for (let childNode of node.children) {
                let result = this.getDescendantByAttributes(childNode, name, attribute, value);
                if (result !== null) {
                    return result;
                }
            }
        }
        return null;
    }
}