var app;
(function (app) {
    'use strict';
    let config = ($routeProvider) => {
        $routeProvider
            .when('/', {
            templateUrl: () => { },
            controller: 'RssSourcesController',
            controllerAs: 'vm'
        });
    };
    config.$inject = ['$routeProvider'];
    angular.module('app').config(config);
})(app || (app = {}));
//# sourceMappingURL=route-config.js.map