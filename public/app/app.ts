/// <reference path="../../typings/index.d.ts" />

'user strict';
angular.module('app', ['ngRoute', 'ui.select', 'ngSanitize', 'ngAnimate', 'ui.bootstrap'])
    .config([
        '$routeProvider', ($routeProvider) => {
            $routeProvider.otherwise({ redirectTo: '/' });
        }
    ]);


/*

'ui.select',
    'ngResource',
    'ngAnimate',
    'ui.bootstrap',
    'ui.bootstrap.modal'
*/

