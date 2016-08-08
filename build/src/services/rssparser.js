/**
 *
 * RSS Feed parser. Based upon feed-read package
 */
"use strict";
const sax = require('sax');
const _ = require('underscore');
const UUID = require('node-uuid');
const binaryprovider_1 = require('./binaryprovider');
const contentstorage_1 = require('./contentstorage');
class RssParser {
    constructor(callback) {
        this.callback = callback;
        this.parser = new sax.SAXParser(true, {
            trim: true,
            normalize: true
        });
        this.article = {};
        this.articles = [];
        this.cs = contentstorage_1.ContentStorage;
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
    parse(xml, source) {
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
    identify(xml) {
        if (/<(rss|rdf)\b/i.test(xml)) {
            return 'rss';
        }
        else if (/<feed\b/i.test(xml)) {
            return 'atom';
        }
        else {
            return null;
        }
    }
    write(xml) {
        this.parser.write(xml).close();
    }
    ;
    open(tag) {
        tag.parent = this.current_tag;
        tag.children = [];
        if (tag.parent) {
            tag.parent.children.push(tag);
        }
        this.current_tag = tag;
        this.onopentag(tag);
    }
    close(tagname) {
        this.onclosetag(tagname, this.current_tag);
        if (this.current_tag && this.current_tag.parent) {
            let p = this.current_tag.parent;
            delete this.current_tag.parent;
            this.current_tag = p;
        }
    }
    ontext(text) {
        if (this.current_tag) {
            this.current_tag.children.push(text);
        }
    }
    onopentag(tag) {
        if (tag.name === 'entry') {
            this.article = tag;
        }
    }
    ;
    onclosetag(tagname, currentTag) {
        if (tagname === 'entry') {
            this.articles.push(this.article);
            this.article = null;
        }
        else if (tagname === 'author' && !this.article) {
            this.default_author = this.childData(currentTag, 'name');
        }
        else if (tagname === 'link' && currentTag.attributes.rel !== 'self') {
            this.meta.link || (this.meta.link = currentTag.attributes.href);
        }
        else if (tagname === 'title' && !currentTag.parent.parent) {
            this.meta.name = currentTag.children[0];
        }
    }
    ;
    onend() {
        this.callback(_.filter(_.map(this.articles, (art) => {
            if (!art.children.length) {
                return null;
            }
            let published = this.childData(art, 'published') || this.childData(art, 'updated');
            let datePublished;
            if (published) {
                datePublished = new Date(published);
            }
            else {
                datePublished = new Date(Date.now());
            }
            let header = {
                publishDate: datePublished,
                uuid: UUID.v4(),
                title: this.childData(art, 'title'),
                description: this.scrubHtml(this.childData(art, 'description')),
                link: this.childByName(art, 'link').attributes.href,
                source: this.childData(art, 'source'),
                hasLogo: false,
                hasEnclosure: false
            };
            if (header.hasEnclosure) {
                binaryprovider_1.BinaryProvider.getBinaryData(art.enclosure, (buffer) => {
                    this.cs.saveEnclosure(header.uuid, buffer);
                });
            }
            return header;
        }), art => (!!art)));
    }
    atom(xml, source) {
        this.articles = [];
        this.meta = {
            source: source
        };
        this.parser.write(xml);
    }
    rss(xml, source) {
        this.articles = [];
        this.meta = {
            source: source
        };
        this.onopentag = (tag) => {
            if (tag.name === 'item') {
                this.article = tag;
            }
        };
        this.onclosetag = (tagname, currentTag) => {
            if (tagname === 'item') {
                this.articles.push(this.article);
                this.article = null;
            }
            else if (tagname === 'channel') {
                this.meta.link || (this.meta.link = this.childData(currentTag, 'link'));
                this.meta.name = this.childData(currentTag, 'title');
                if (!source.hasLogo) {
                    let logoTag = this.childByName(currentTag, 'image');
                    if (logoTag) {
                        let logoUrl = this.childData(logoTag, 'url');
                        if (logoUrl) {
                            if (!logoUrl.includes('http')) {
                                logoUrl = 'http:' + logoUrl;
                            }
                            source.hasLogo = true;
                            binaryprovider_1.BinaryProvider.getBinaryData(logoUrl, (logo) => {
                                this.cs.saveLogo(source.name, logo);
                            });
                        }
                    }
                }
            }
            else if (tagname === 'enclosure') {
                if (currentTag.attributes && currentTag.attributes['url']) {
                    this.article.hasEnclosure = true;
                    this.article.enclosure = currentTag.attributes['url'];
                }
            }
        };
        this.onend = () => {
            this.callback(_.filter(_.map(this.articles, (article) => {
                if (!article.children.length) {
                    return null;
                }
                let published = this.childData(article, 'pubDate');
                let datePublished;
                if (published) {
                    datePublished = new Date(published);
                }
                else {
                    datePublished = new Date(Date.now());
                }
                var header = {
                    publishDate: datePublished,
                    title: this.childData(article, 'title'),
                    description: this.scrubHtml(this.childData(article, 'content:encoded')) || this.scrubHtml(this.childData(article, 'description')),
                    link: this.childData(article, 'link'),
                    source: this.childData(article, 'source'),
                    uuid: UUID.v4(),
                    hasLogo: source.hasLogo,
                    hasEnclosure: article.hasEnclosure
                };
                if (article.hasEnclosure) {
                    binaryprovider_1.BinaryProvider.getBinaryData(article.enclosure, (buffer) => {
                        this.cs.saveEnclosure(header.uuid, buffer);
                    });
                }
                return header;
            }), art => (!!art)));
        };
        this.write(xml);
    }
    scrubHtml(html) {
        return html.replace(/<script.*<\/script>/gi, '');
    }
    childByName(parent, name) {
        let children = parent.children || [];
        for (let i = 0; i < children.length; i++) {
            if (children[i].name === name) {
                return children[i];
            }
        }
        return null;
    }
    childData(parent, name) {
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
exports.RssParser = RssParser;
//# sourceMappingURL=rssparser.js.map