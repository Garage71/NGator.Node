/**
 * Angular application the only controller
*/

'use strict';

import * as si from '../../src/shared/interfaces';

module app {

    interface IArticle {
        date: string;
        uuid: string;
        header: string;
        quote: string;
        link: string;
        source: string;
        hasLogo: boolean;
        body: {
            body: string,
            hasPicture: boolean,
        };
        hasEnclosure: boolean;
    }

    export class RssSourcesController {
        static $inject = ['$http', '$scope'];
        sources: si.IRSSSource[] = [];
        newsHeaders: si.INewsHeader[] = [];
        newsList = [];
        isLoadingNews = false;
        selectedSources: si.IRSSSource[] = [];
        totalItems: number;
        maxSize = 10;
        currentPage = 1;
        progress = 0;

        private articlesRequest = {
            rssSources: [],
            refresh: true,
            currentPage: 1
        };

        constructor(private $http: ng.IHttpService, private socket: any) {
            $http.get('/api/sources').then((response: any) => {
                let container = response.data as si.IRSSSources;
                this.sources = container.rsssources;
                this.selectedSources.push(this.sources[0]);
                this.socket.on('progress', (data: number): void => {
                    this.progress = data;
                });
            });
        }

        getNews(): void {
            this.articlesRequest.rssSources = [];
            this.articlesRequest.refresh = true;
            this.articlesRequest.currentPage = 1;
            for (let source of this.selectedSources) {
                this.articlesRequest.rssSources.push(source);
            }
            this.newsList = [];
            this.totalItems = 0;
            this.isLoadingNews = true;
            this.$http.post('/api/sources', this.articlesRequest).then((response: any) => {
                let container = response.data as si.INewsHeaders;
                this.newsHeaders = container.newsHeaders;
                this.newsList = this.processNewsList(this.newsHeaders);
                this.totalItems = container.totalArticlesCount;
                this.isLoadingNews = false;
                this.progress = 0;
            });
        }

        pageChanged(): void {
            this.articlesRequest.rssSources = [];
            this.articlesRequest.refresh = false;
            this.articlesRequest.currentPage = this.currentPage;
            for (let source of this.selectedSources) {
                this.articlesRequest.rssSources.push(source);
            }

            this.$http.post('/api/sources', this.articlesRequest).then((response: any) => {
                this.newsList = [];
                let container = response.data as si.INewsHeaders;
                this.newsHeaders = container.newsHeaders;
                this.newsList = this.processNewsList(this.newsHeaders);
                this.totalItems = container.totalArticlesCount;
            });
        }

        private processNewsList(headers: si.INewsHeader[]): IArticle[] {
            let articles: IArticle[] = [];
            for (let header of headers) {
                let stringDate = new Date(Date.parse(header.publishDate.toLocaleString()))
                    .toLocaleString('ru-RU', { hour12: false });
                let article: IArticle = {
                    date: stringDate,
                    uuid: header.uuid,
                    header: header.title,
                    quote: header.description,
                    link: header.link,
                    source: header.source,
                    hasLogo: header.hasLogo,
                    body: {
                        body: '',
                        hasPicture: false
                    },
                    hasEnclosure: header.hasEnclosure
                };
                this.articleLoader(article);
                articles.push(article);
            }
            return articles;
        }

        private articleLoader(article: IArticle): void {
            let isOpened = false;
            Object.defineProperty(article, 'isOpened', {
                    get: (): boolean => {
                         return isOpened;
                    },
                    set: (newValue: boolean): void =>  {
                        isOpened = newValue;
                        if (isOpened && !article.body.body) {
                            this.$http.get('/api/sources/article/' + article.uuid)
                                .then( (data: any) => {
                                    article.body.body = data.data.body;
                                    article.body.hasPicture = data.data.hasPicture;
                                    if (article.hasEnclosure || data.data.hasPicture) {
                                        let imgContainer = $('#' + article.uuid + '-pic');
                                        imgContainer.empty();
                                        imgContainer.append('<img src=\'api/sources/picture/'
                                            + article.uuid + '\' class=\'article-picture\' />');
                                    }
                                }).catch((reason: any) => {
                                    article.body.body = reason;
                                });
                        }
                    }
            });
        }
    }

    angular.module('app')
        .controller('RssSourcesController',
        [
            '$http', 'socket', ($http: ng.IHttpService, socket: any) => {
                return new RssSourcesController($http, socket);
            }]);
}