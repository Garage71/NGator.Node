/**
 * Application angular the only controller
*/
'use strict';
var app;
(function (app) {
    class RssSourcesController {
        constructor($http) {
            this.$http = $http;
            this.sources = [];
            this.newsHeaders = [];
            this.newsList = [];
            this.loadButtonEnabled = true;
            this.selectedSources = [];
            this.maxSize = 10;
            this.currentPage = 1;
            this.articlesRequest = {
                rssSources: [],
                refresh: true,
                currentPage: 1
            };
            $http.get('/api/sources').then((response) => {
                let container = response.data;
                this.sources = container.rsssources;
                this.selectedSources.push(this.sources[0]);
            });
        }
        getNews() {
            this.articlesRequest.rssSources = [];
            this.articlesRequest.refresh = true;
            this.articlesRequest.currentPage = 1;
            for (let source of this.selectedSources) {
                this.articlesRequest.rssSources.push(source);
            }
            this.newsList = [];
            this.totalItems = 0;
            this.$http.post('/api/sources', this.articlesRequest).then((response) => {
                let container = response.data;
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
        pageChanged() {
            this.articlesRequest.rssSources = [];
            this.articlesRequest.refresh = false;
            this.articlesRequest.currentPage = this.currentPage;
            for (let source of this.selectedSources) {
                this.articlesRequest.rssSources.push(source);
            }
            this.$http.post('/api/sources', this.articlesRequest).then((response) => {
                this.newsList = [];
                let container = response.data;
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
    RssSourcesController.$inject = ['$http'];
    app.RssSourcesController = RssSourcesController;
    angular.module('app')
        .controller('RssSourcesController', [
        '$http', ($http) => {
            return new RssSourcesController($http);
        }]);
})(app || (app = {}));
//# sourceMappingURL=rsssources.js.map