/**
* Rss news list provider
*/
"use strict";
const request = require('request');
const contentStorage = require('./contentstorage');
const rssParser = require('./rssparser');
class NewsProvider {
    constructor() {
        this.cs = new contentStorage.ContentStorage();
    }
    getNews(sources, page, refresh, callBack) {
        let feed = new Map();
        sources.forEach(src => feed.set(src, {
            sourceFeed: [],
            isLoaded: false
        }));
        /*
        if (!refresh) {
            for (let src of sources) {
                let headers = this.cs.getArticlesBySource(src).map(article => article.header);
                headers.forEach(header => result.push(header));
                return result;
            }
        }
        */
        for (let source of sources) {
            let result = [];
            let req = request(source.url, (err, resp, data) => {
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
                parser.parse(data);
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
                    callBack(finalFeed);
                }
            });
        }
        ;
    }
}
exports.NewsProvider = NewsProvider;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NewsProvider;

//# sourceMappingURL=newsprovider.js.map
