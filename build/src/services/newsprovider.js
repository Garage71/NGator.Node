/**
* Rss news list provider
*/
"use strict";
const request = require('request');
let feedParser = require('feedparser');
const UUID = require('node-uuid');
const contentStorage = require('./contentstorage');
class NewsProvider {
    constructor() {
        this.cs = new contentStorage.ContentStorage();
    }
    getNews(sources, page, refresh) {
        let result = [];
        if (!refresh) {
            for (let src of sources) {
                let headers = this.cs.getArticlesBySource(src).map(article => article.header);
                headers.forEach(header => result.push(header));
                return result;
            }
        }
        let parser = new feedParser();
        for (let source of sources) {
            let req = request(source.url);
            parser.on('error', (error) => {
                console.log('FeedParser error: ' + error);
            });
            parser.on('readable', () => {
                let stream = parser;
                let meta = stream.meta;
                if (!source.picture) {
                    if (meta.image && meta.image.url) {
                        let picreq = request(meta.image.url);
                        picreq.on('data', (data) => {
                            source.picture = data;
                        });
                    }
                }
                let item;
                console.log(meta);
                while (item = stream.read()) {
                    let newsHeader = {
                        source: item.source,
                        description: item.description,
                        enclosure: item.enclosure,
                        hasEnclosure: item.enclosure ? true : false,
                        hasLogo: source.picture ? true : false,
                        link: item.link,
                        publishDate: item.publishDate,
                        title: item.title,
                        uuid: UUID.v4()
                    };
                    let body = {
                        body: '',
                        hasPicture: newsHeader.hasEnclosure
                    };
                    let article = {
                        uuid: newsHeader.uuid,
                        rssSource: source,
                        header: newsHeader,
                        body: body
                    };
                    this.cs.saveArticle(article);
                    result.push(newsHeader);
                }
                return result;
            });
            req.on('error', (err) => {
                console.log(err);
            });
            req.on('response', (response) => {
                if (response.statusCode !== 200) {
                    console.log(`RSS Server responded invalid status code: ${response.statusCode}`);
                    return;
                }
                response.pipe(parser);
            });
        }
        ;
    }
}
exports.NewsProvider = NewsProvider;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NewsProvider;
//# sourceMappingURL=newsprovider.js.map