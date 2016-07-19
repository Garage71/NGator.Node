/**
 * Application angular the only controller
*/

'use strict';

import * as si from '../../src/shared/interfaces';

module app {
    export class RssSourcesController {
        static $inject = ['$http'];
        sources: si.IRSSSource[] = [];
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
            console.log(this.selectedSources);
        }
        /*
        $scope.newsList = [];
        $scope.modalScope = $scope.$new();
        $scope.modal = $controller("ModalController", { $scope: $scope.modalScope });

        var response = $http.get("/api/sources");
    response.success(function (data, status, headers, config) {

        data.sources.forEach(function (src) {
            $scope.sources.push(src.siteName);
        });

    }).error(function (data, status, headers, config) {
        console.log("Error occuted during sources loading:" + status);
    });

    $scope.loadButtonEnabled = true;
    $scope.selectedSources = {};
    $scope.selectedSources.selected = ["Lenta.ru"];

    $scope.maxSize = 10;
    $scope.totalItems = 375;
    $scope.currentPage = 1;

    $scope.sourcesRequest = {
        "page": $scope.currentPage,
        "sources": [],
        "refresh": true
    };

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.pageChanged = function () {
        $scope.sourcesRequest.page = $scope.currentPage;
        $scope.sourcesRequest.refresh = false;
        $scope.obtainArticles($scope.sourcesRequest);
    };
    */
    }   
    angular.module('app').controller('RssSourcesController', RssSourcesController);
}