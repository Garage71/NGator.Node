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
            $http.get('/api/sources').then(function (response) {
                var container = response.data;
                _this.sources = container.rsssources;
                _this.selectedSources.push(_this.sources[0]);
            });
        }
        RssSourcesController.prototype.getNews = function () {
            var _this = this;
            var sources = [];
            var request = {
                rsssources: sources
            };
            for (var _i = 0, _a = this.selectedSources; _i < _a.length; _i++) {
                var source = _a[_i];
                sources.push(source);
            }
            this.$http.post('/api/sources', request).then(function (response) {
                var container = response.data;
                _this.newsHeaders = container.newsHeaders;
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