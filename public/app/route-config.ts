module app {

    'use strict';

    let config = ($routeProvider): void => {
        $routeProvider
            .when('/',
            {
                templateUrl: () => {},
                controller: 'RssSourcesController',
                controllerAs: 'vm'
            });
    };

    config.$inject = ['$routeProvider'];

    angular.module('app').config(config);
}
