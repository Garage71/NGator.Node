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
            console.log(this.selectedSources);
        }
    }
    RssSourcesController.$inject = ['$http'];
    app.RssSourcesController = RssSourcesController;
    angular.module('app').controller('RssSourcesController', RssSourcesController);
})(app || (app = {}));
//# sourceMappingURL=rsssources.js.map