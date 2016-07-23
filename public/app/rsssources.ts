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
        constructor(private $http: ng.IHttpService) {
            $http.get('/api/sources').then((response: any) => {
                let container = response.data as si.IRSSSources;
                this.sources = container.rsssources;
                this.selectedSources.push(this.sources[0]);
            });
        }

        getNews(): void {
            let sources: si.IRSSSource[] = [];
            let request: si.IRSSSources = {
                rsssources: sources
            };
            for (let source of this.selectedSources) {
                sources.push(source);
            }
            this.$http.post('/api/sources', request).then((response: any) => {
                let container = response.data as si.INewsHeaders;
                this.newsHeaders = container.newsHeaders;
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