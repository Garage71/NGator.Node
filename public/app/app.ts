/// <reference path="../../typings/index.d.ts" />
/**
* Application main module declaration
*/

'user strict';
angular.module('app', ['ngRoute', 'ui.select', 'ngSanitize', 'ngAnimate', 'ui.bootstrap'])
    .config([
        '$routeProvider', ($routeProvider) => {
            $routeProvider.otherwise({ redirectTo: '/' });
        }
    ]);