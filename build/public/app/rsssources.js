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
            $http.get('/api/sources').then((response) => {
                let container = response.data;
                this.sources = container.rsssources;
                this.selectedSources.push(this.sources[0]);
            });
        }
        getNews() {
            let sources = [];
            let request = {
                rsssources: sources
            };
            for (let source of this.selectedSources) {
                sources.push(source);
            }
            this.$http.post('/api/sources', request).then((response) => {
                let container = response.data;
                this.newsHeaders = container.newsHeaders;
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