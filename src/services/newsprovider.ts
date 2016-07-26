
/**
* Rss news list provider
*/

import * as http from 'http';
import * as https from 'https';
import * as si from '../shared/interfaces';
import * as request from 'request';
let feedParser = require('feedparser');
import * as UUID from 'node-uuid';
import * as contentStorage from './contentstorage';

export class NewsProvider {
    private cs = new contentStorage.ContentStorage();
    getNews(sources: si.IRSSSource[], page: number, refresh: boolean): si.INewsHeader[] {
        let result: si.INewsHeader[] = [];
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
            parser.on('error', (error: any)  => {
                console.log('FeedParser error: ' + error);
            });
            parser.on('readable', () => {
                let stream = parser;
                let meta = stream.meta;
                if (!source.picture) {
                    if (meta.image && meta.image.url) {
                        let picreq = request(meta.image.url);                        
                        picreq.on('data', (data: Buffer) => {
                            source.picture = data;                            
                        });
                    }
                }
                let item: any;
                console.log(meta);
                while (item = stream.read()) {                    
                    let newsHeader: si.INewsHeader = {
                        source: item.source,
                        description: item.description,
                        enclosure: item.enclosure,
                        hasEnclosure: item.enclosure ? true : false,
                        hasLogo: source.picture ? true: false,
                        link: item.link,
                        publishDate: item.publishDate,
                        title: item.title,
                        uuid: UUID.v4()
                    };
                    let body: si.IBodyContainer = {
                        body: '',
                        hasPicture: newsHeader.hasEnclosure
                    };
                    let article: si.IArticleContainer = {
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
            req.on('response', (response: http.IncomingMessage) => {

                if (response.statusCode !== 200) {
                    console.log(`RSS Server responded invalid status code: ${response.statusCode}`);
                    return;
                }
                response.pipe(parser);
            });
        };
    }
}

export default NewsProvider;