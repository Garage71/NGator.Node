/**
 *
 * RSS Feed parser. Based upon feed-read package
 */

import * as sax from 'sax';
import * as _ from 'underscore';
import * as si from '../shared/interfaces';
import * as UUID from 'node-uuid';
import {BinaryProvider} from './binaryprovider';
import {ContentStorage} from './contentstorage';

export class RssParser {
    private parser = new sax.SAXParser(true, {
        trim: true,
        normalize: true
    });
    private currentTag: any;
    private article: any = {};
    private articles: any[] = [];
    private defaultAuthor: any;
    private meta: any;
    private error: any;
    private cs = ContentStorage;
    constructor(private callback: any) {
        this.parser.onopentag = (tag) => {
             this.open(tag);
        };
        this.parser.onclosetag = (tag) => {
             this.close(tag);
        };

        this.parser.onerror = () => {
            this.error = undefined;
        };
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

    parse(xml: string, source: si.IRSSSource): void {
        let rssType = this.identify(xml);
        switch (rssType) {
            case 'rss':
                this.rss(xml, source);
                break;
            case 'atom':
                this.atom(xml, source);
                break;
            default:
                break;
        }
    }

    private identify(xml: string) : string {
        if (/<(rss|rdf)\b/i.test(xml)) {
            return 'rss';
        } else if (/<feed\b/i.test(xml)) {
            return 'atom';
        } else {
            return null;
        }
    }

    write(xml: string): void {
        this.parser.write(xml).close();
    };

    private open (tag: any): void {
        tag.parent = this.currentTag;
        tag.children = [];
        if (tag.parent) {
             tag.parent.children.push(tag);
        }
        this.currentTag = tag;
        this.onopentag(tag);
    }

    private close (tagname: string): void {
        this.onclosetag(tagname, this.currentTag);
        if (this.currentTag && this.currentTag.parent) {
            let p = this.currentTag.parent;
            delete this.currentTag.parent;
            this.currentTag = p;
        }
    }

    private ontext (text: string): void {
        if (this.currentTag) {
            this.currentTag.children.push(text);
        }
    }

    private onopentag(tag: any): void {
        if (tag.name === 'entry') {
             this.article = tag;
        }
    };

    private onclosetag (tagname: string, currentTag: any): void {
        if (tagname === 'entry') {
            this.articles.push(this.article);
            this.article = null;
        } else if (tagname === 'author' && !this.article) {
            this.defaultAuthor = this.childData(currentTag, 'name');
        } else if (tagname === 'link' && currentTag.attributes.rel !== 'self') {
            if (!this.meta.link) {
                this.meta.link = currentTag.attributes.href;
            }
        } else if (tagname === 'title' && !currentTag.parent.parent) {
            this.meta.name = currentTag.children[0];
        }
    };

    private onend (): any {
        this.callback(_.filter(_.map(this.articles,
            (art) => {
                if (!art.children.length) {
                     return null;
                }
                let published = this.childData(art, 'published') || this.childData(art, 'updated');
                let datePublished: Date;
                if (published) {
                    datePublished = new Date(published);
                } else {
                    datePublished = new Date(Date.now());
                }
                let header: si.INewsHeader = {
                    publishDate: datePublished,
                    uuid: UUID.v4(),
                    title: this.childData(art, 'title'),
                    description: this.scrubHtml(this.childData(art, 'description')),
                    link: this.childByName(art, 'link').attributes.href,
                    source: this.childData(art, 'source'),
                    hasLogo: false,
                    hasEnclosure: false,
                    enclosure: ''
                };

                if (header.hasEnclosure) {
                    BinaryProvider.GETBINARYDATA(art.enclosure, (buffer) => {
                        this.cs.saveEnclosure(header.uuid, buffer);
                    });
                }
                return header;
            }
        ), art => (!!art)));
    }

    atom(xml: string, source: si.IRSSSource): void {
        this.articles = [];

        this.meta = {
             source: source
        };

        this.parser.write(xml);
    }

    rss(xml: string, source: si.IRSSSource): void {
        this.articles = [];

        this.meta = {
            source: source
        };

        this.onopentag = (tag) => {
            if (tag.name === 'item') {
                this.article = tag;
            }
        };

        this.onclosetag =  (tagname: string, currentTag: sax.Tag) => {
            if (tagname === 'item') {
                this.articles.push(this.article);
                this.article = null;
            } else if (tagname === 'channel') {
                if (!this.meta.link) {
                    this.meta.link = this.childData(currentTag, 'link');
                }
                this.meta.name = this.childData(currentTag, 'title');
                if (!source.hasLogo) {
                    let logoTag = this.childByName(currentTag, 'image');
                    if (logoTag) {
                        let logoUrl = this.childData(logoTag, 'url');

                        if (logoUrl) {
                            if (!logoUrl.includes('http')) {
                                logoUrl = `http:${logoUrl}`;
                            }
                            source.hasLogo = true;
                            BinaryProvider.GETBINARYDATA(logoUrl,
                            (logo) => {
                                this.cs.saveLogo(source.name, logo);
                            });
                        }
                    }
                }
            } else if (tagname === 'enclosure') {
                if (currentTag.attributes && currentTag.attributes['url']) {
                    this.article.hasEnclosure = true;
                    this.article.enclosure = currentTag.attributes['url'];
                }
            }
        };

        this.onend = (): any => {
            this.callback(_.filter(_.map(this.articles,
                (article) => {
                    if (!article.children.length) {
                        return null;
                    }

                    let published = this.childData(article, 'pubDate');
                    let datePublished: Date;
                    if (published) {
                        datePublished = new Date(published);
                    } else {
                        datePublished = new Date(Date.now());
                    }

                    let header: si.INewsHeader = {
                        publishDate: datePublished,
                        title: this.childData(article, 'title'),
                        description: this.scrubHtml(this.childData(article, 'content:encoded'))
                        || this.scrubHtml(this.childData(article, 'description')),
                        link: this.childData(article, 'link'),
                        source: this.childData(article, 'source'),
                        uuid: UUID.v4(),
                        hasLogo: source.hasLogo,
                        hasEnclosure: article.hasEnclosure,
                        enclosure: article.enclosure
                    };

                    if (article.hasEnclosure) {
                        BinaryProvider.GETBINARYDATA(article.enclosure, (buffer) => {
                            this.cs.saveEnclosure(header.uuid, buffer);
                        });
                    }

                    return header;
                }
            ), art => (!!art)));
        };

        this.write(xml);
    }

    private scrubHtml(html: string): string {
        return html.replace(/<script.*<\/script>/gi, '');
    }

    private  childByName(parent: any, name: string): any {
        let children = parent.children || [];
        for (let child of children) {
            if (child.name === name) {
                return child;
            }
        }
        return null;
    }

    private childData(parent: any, name: string): string {
        let node = this.childByName(parent, name);
        if (!node) {
            return '';
        }
        let children = node.children;
        if (!children.length) {
            return '';
        }
        return children.join('');
    }
}