
/**
* Rss news list provider
*/

import * as si from '../shared/interfaces';
import * as request from 'request';
import * as contentStorage from './contentstorage';
import * as rssParser from './rssparser';
import * as _ from 'underscore';

export class NewsProvider {
    private cs = new contentStorage.ContentStorage();
    private PageSize = 10;
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

        if (!refresh) {
            for (let src of sources) {
                let headers = this.cs.getArticlesBySource(src).map(article => article.header).sort(this.sorter);
                callBack(headers.slice((page - 1) * this.PageSize, page * this.PageSize), headers.length);
            }
        }

        for (let source of sources) {
            let result: si.INewsHeader[] = [];
            let req = request(source.url,
            (err, resp, data) => {                
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
                parser.parse(data, source);

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