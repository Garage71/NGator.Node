/**
 * Application angular the only controller
*/
'use strict';
var app;
(function (app) {
    var RssSourcesController = (function () {
        function RssSourcesController($http) {
            var _this = this;
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
            $http.get('/api/sources').then(function (response) {
                var container = response.data;
                _this.sources = container.rsssources;
                _this.selectedSources.push(_this.sources[0]);
            });
        }
        RssSourcesController.prototype.getNews = function () {
            var _this = this;
            this.articlesRequest.rssSources = [];
            this.articlesRequest.refresh = true;
            this.articlesRequest.currentPage = 1;
            for (var _i = 0, _a = this.selectedSources; _i < _a.length; _i++) {
                var source = _a[_i];
                this.articlesRequest.rssSources.push(source);
            }
            this.newsList = [];
            this.totalItems = 0;
            this.$http.post('/api/sources', this.articlesRequest).then(function (response) {
                var container = response.data;
                _this.newsHeaders = container.newsHeaders;
                _this.newsHeaders.forEach(function (header) {
                    var stringDate = header.publishDate.toLocaleString('ru-RU', { hour12: false });
                    _this.newsList.push({
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
                _this.totalItems = container.totalArticlesCount;
            });
        };
        RssSourcesController.prototype.pageChanged = function () {
            var _this = this;
            this.articlesRequest.rssSources = [];
            this.articlesRequest.refresh = false;
            this.articlesRequest.currentPage = this.currentPage;
            for (var _i = 0, _a = this.selectedSources; _i < _a.length; _i++) {
                var source = _a[_i];
                this.articlesRequest.rssSources.push(source);
            }
            this.$http.post('/api/sources', this.articlesRequest).then(function (response) {
                _this.newsList = [];
                var container = response.data;
                _this.newsHeaders = container.newsHeaders;
                _this.newsHeaders.forEach(function (header) {
                    var stringDate = header.publishDate.toLocaleString('ru-RU', { hour12: false });
                    _this.newsList.push({
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
                _this.totalItems = container.totalArticlesCount;
            });
        };
        RssSourcesController.$inject = ['$http'];
        return RssSourcesController;
    }());
    app.RssSourcesController = RssSourcesController;
    angular.module('app')
        .controller('RssSourcesController', [
        '$http', function ($http) {
            return new RssSourcesController($http);
        }]);
})(app || (app = {}));
//# sourceMappingURL=rsssources.js.map