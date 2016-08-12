/**
 * Angular application route config
 * 
 */

module app {
    'use strict';

    let config = ($routeProvider): void => {
        $routeProvider
            .when('/', {
                templateUrl: (): void => {
                    return;
                },
                controller: 'RssSourcesController',
                controllerAs: 'vm'
            });
    };

    config.$inject = ['$routeProvider'];

    angular.module('app').config(config);
}
