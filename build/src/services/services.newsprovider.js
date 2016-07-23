/**
* Rss news list provider
*/
"use strict";
const request = require('request');
let feedParser = require('feedparser');
const UUID = require('node-uuid');
class NewsProvider {
    getNews(sources, page, refresh) {
        let parser = new feedParser();
        for (let source of sources) {
            let req = request(source.url);
            parser.on('error', (error) => {
                console.log('FeedParser error: ' + error);
            });
            parser.on('readable', () => {
                let stream = parser;
                let meta = stream.meta;
                let item;
                console.log(meta);
                while (item = stream.read()) {
                    let newsHeader = {
                        source: item.source,
                        description: item.description,
                        enclosure: item.enclosure,
                        hasEnclosure: item.enclosure ? true : false,
                        hasLogo: false,
                        link: item.link,
                        publishDate: item.publishDate,
                        title: item.title,
                        guid: UUID.v4()
                    };
                    console.log(newsHeader);
                }
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
//# sourceMappingURL=services.newsprovider.js.map