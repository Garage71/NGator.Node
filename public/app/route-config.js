var app;
(function (app) {
    'use strict';
    var config = function ($routeProvider) {
        $routeProvider
            .when('/', {
            templateUrl: function () { },
            controller: 'RssSourcesController',
            controllerAs: 'vm'
        });
    };
    config.$inject = ['$routeProvider'];
    angular.module('app').config(config);
})(app || (app = {}));
//# sourceMappingURL=route-config.js.map