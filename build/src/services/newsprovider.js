/**
* Rss news list provider
*/
"use strict";
const request = require('request');
const contentstorage_1 = require('./contentstorage');
const rssParser = require('./rssparser');
const iconv = require('iconv');
class NewsProvider {
    constructor() {
        this.PageSize = 10;
        this.cs = contentstorage_1.ContentStorage;
    }
    getNews(sources, page, refresh, callBack) {
        let feed = new Map();
        sources.forEach(src => feed.set(src, {
            sourceFeed: [],
            isLoaded: false
        }));
        let encoder = new iconv.Iconv('cp1251', 'utf8');
        if (!refresh) {
            let finalFeed = [];
            for (let src of sources) {
                let feed = this.cs.getArticlesBySource(src);
                let headers = feed.map(article => article.header).sort(this.sorter);
                for (let header of headers) {
                    finalFeed.push(header);
                }
            }
            callBack(finalFeed.slice((page - 1) * this.PageSize, page * this.PageSize), finalFeed.length);
            return;
        }
        for (let source of sources) {
            let result = [];
            let req = request(source.url, {
                encoding: null
            }, (err, resp, data) => {
                let rssData = data;
                if (source.name === 'VZ.ru') {
                    rssData = encoder.convert(data);
                }
                let parser = new rssParser.RssParser((headers) => {
                    for (let header of headers) {
                        header.source = source.name;
                        let body = {
                            body: '',
                            hasPicture: header.hasEnclosure
                        };
                        let article = {
                            uuid: header.uuid,
                            rssSource: source,
                            header: header,
                            body: body
                        };
                        this.cs.saveArticle(article);
                        result.push(header);
                    }
                    feed.set(source, {
                        sourceFeed: result,
                        isLoaded: true
                    });
                });
                parser.parse(rssData.toString(), source);
                let isCompleted = true;
                let finalFeed = [];
                for (let src of feed) {
                    let sourceFeed = src['1'];
                    if (!sourceFeed.isLoaded) {
                        isCompleted = false;
                    }
                    else {
                        for (let header of sourceFeed.sourceFeed) {
                            finalFeed.push(header);
                        }
                    }
                }
                if (isCompleted) {
                    finalFeed = finalFeed.sort(this.sorter);
                    let sliced = finalFeed.slice(0, this.PageSize);
                    let totalCount = finalFeed.length;
                    callBack(sliced, totalCount);
                }
            });
        }
    }
    sorter(h1, h2) {
        if (h1.publishDate < h2.publishDate) {
            return 1;
        }
        else if (h1.publishDate > h2.publishDate) {
            return -1;
        }
        return 0;
    }
}
exports.NewsProvider = NewsProvider;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NewsProvider;
//# sourceMappingURL=newsprovider.js.map