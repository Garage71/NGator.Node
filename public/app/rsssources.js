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
                _this.newsList = _this.processNewsList(_this.newsHeaders);
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
                _this.newsList = _this.processNewsList(_this.newsHeaders);
                _this.totalItems = container.totalArticlesCount;
            });
        };
        RssSourcesController.prototype.processNewsList = function (headers) {
            var articles = [];
            for (var _i = 0, headers_1 = headers; _i < headers_1.length; _i++) {
                var header = headers_1[_i];
                var stringDate = new Date(Date.parse(header.publishDate.toLocaleString())).toLocaleString('ru-RU', { hour12: false });
                var article = {
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
        };
        RssSourcesController.prototype.articleLoader = function (article) {
            var _this = this;
            var isOpened = false;
            Object.defineProperty(article, 'isOpened', {
                get: function () {
                    return isOpened;
                },
                set: function (newValue) {
                    isOpened = newValue;
                    if (isOpened && !article.body.body) {
                        _this.$http.get('/api/sources/article/' + article.uuid)
                            .then(function (data) {
                            article.body.body = data.data.body;
                            article.body.hasPicture = data.data.hasPicture;
                            if (article.hasEnclosure || data.data.hasPicture) {
                                var imgContainer = $('#' + article.uuid + '-pic');
                                imgContainer.empty();
                                imgContainer.append('<img src=\'api/sources/picture/' + article.uuid + '\' class=\'article-picture\' />');
                            }
                        }).catch(function (reason) {
                            article.body.body = reason;
                        });
                    }
                }
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