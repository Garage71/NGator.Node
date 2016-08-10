
/**
* Rss news list provider
*/

import * as si from '../shared/interfaces';
import * as request from 'request';
import {ContentStorage} from './contentstorage';
import * as rssParser from './rssparser';
import * as iconv from 'iconv';
import {IncomingMessage} from "http";

export class NewsProvider {
    
    private PageSize = 10;
    private cs = ContentStorage;
    getNews(sources: si.IRSSSource[], page: number, refresh: boolean, callBack: (newsFeed: si.INewsHeader[], totalCount: number) => void):
        void {

        let feed: Map<si.IRSSSource, {
            sourceFeed: si.INewsHeader[],
            isLoaded: boolean,
        }> = new Map();
        sources.forEach(src => feed.set(src, {
            sourceFeed: [],
            isLoaded: false
        }));
        let encoder = new iconv.Iconv('cp1251', 'utf8');
        if (!refresh) {
            let finalFeed: si.INewsHeader[] = [];
            for (let src of sources) {
                let feed = this.cs.getArticlesBySource(src).map((article) => {return article.header});                
                for(let header of feed) {
                    finalFeed.push(header);
                }
            }
            let headers = finalFeed.sort(this.sorter);
            callBack(headers.slice((page - 1) * this.PageSize, page * this.PageSize), finalFeed.length);
            return;
        }
        this.cs.clear();

        for (let source of sources) {
            let result: si.INewsHeader[] = [];
            let req = request(source.url, {
                    encoding: null
                },
                (err: Error, resp: IncomingMessage, data: Buffer) => {
                    let rssData = data;
                    if(source.name === 'VZ.ru') {
                        rssData = encoder.convert(data);
                    }

                    let parser = new rssParser.RssParser((headers: si.INewsHeader[]) => {
                    for (let header of headers) {
                        header.source = source.name;
                        let body: si.IBodyContainer = {
                            body: '',
                            hasPicture: header.hasEnclosure
                        };
                        let article: si.IArticleContainer = {
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
                let finalFeed: si.INewsHeader[] = [];
                for (let src of feed) {
                    let sourceFeed = src['1'];
                    if (!sourceFeed.isLoaded) {
                        isCompleted = false;
                    } else {
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

    private sorter(h1: si.INewsHeader, h2: si.INewsHeader): number {
        if (h1.publishDate < h2.publishDate) {
            return 1;
        } else if (h1.publishDate > h2.publishDate) {
            return -1;
        }
        return 0;
    }
}

export default NewsProvider;