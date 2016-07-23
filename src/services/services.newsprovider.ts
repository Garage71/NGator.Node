
/**
* Rss news list provider
*/

import * as http from 'http';
import * as https from 'https';
import * as si from '../shared/interfaces';
import * as request from 'request';
let feedParser = require('feedparser');
import * as UUID from 'node-uuid';

export class NewsProvider {
    getNews(sources: si.IRSSSource[], page: number, refresh: boolean): void {
        let parser = new feedParser();
        for (let source of sources) {
            let req = request(source.url);            
            parser.on('error', (error: any)  => {
                console.log('FeedParser error: ' + error);
            });
            parser.on('readable', () => {
                let stream = parser;
                let meta = stream.meta;
                let item: any;
                console.log(meta);
                while (item = stream.read()) {
                    let newsHeader: si.INewsHeader = {
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
            req.on('response', (response: http.IncomingMessage) => {

                if (response.statusCode !== 200) {
                    console.log(`RSS Server responded invalid status code: ${response.statusCode}`);
                    return;
                }
                response.pipe(parser);
            });
            
            /*
            request.get(source.url, (error:any, response: http.IncomingMessage, body: any) => {
                if (!error && response.statusCode === 200) {
                    console.log(body); // Show the HTML for the Google homepage.

                } else {
                    console.log(error);
                }
            });
            */
        };
    }
}

export default NewsProvider;