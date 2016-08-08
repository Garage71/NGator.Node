/**
 * Application angular the only controller
*/

'use strict';

import * as si from '../../src/shared/interfaces';

module app {
    export class RssSourcesController {
        static $inject = ['$http'];
        sources: si.IRSSSource[] = [];
        newsHeaders: si.INewsHeader[] = [];
        newsList = [];
        loadButtonEnabled = true;
        selectedSources: si.IRSSSource[] = [];
        totalItems: number;
        maxSize = 10;        
        currentPage = 1;

        private articlesRequest = {
            rssSources: [],
            refresh: true,
            currentPage: 1
        };

        constructor(private $http: ng.IHttpService) {
            $http.get('/api/sources').then((response: any) => {
                let container = response.data as si.IRSSSources;
                this.sources = container.rsssources;
                this.selectedSources.push(this.sources[0]);
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
            this.$http.post('/api/sources', this.articlesRequest).then((response: any) => {
                let container = response.data as si.INewsHeaders;
                this.newsHeaders = container.newsHeaders;
                this.newsHeaders.forEach((header) => {
                    let stringDate = header.publishDate.toLocaleString('ru-RU', { hour12: false });
                    this.newsList.push({
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
                    });
                });
                this.totalItems = container.totalArticlesCount;
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
                this.newsHeaders.forEach((header) => {
                    let stringDate = header.publishDate.toLocaleString('ru-RU', { hour12: false });
                    this.newsList.push({
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
                    });
                });
                this.totalItems = container.totalArticlesCount;
            });
        }
    }

    angular.module('app')
        .controller('RssSourcesController',
        [
            '$http', ($http: ng.IHttpService) => {
                return new RssSourcesController($http);
            }]);
}