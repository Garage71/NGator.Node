/// <reference path="../../typings/index.d.ts" />
/**
* Application main module declaration
*/

'user strict';
angular.module('app', ['ngRoute', 'ui.select', 'ngSanitize', 'ngAnimate', 'ui.bootstrap', 'btford.socket-io'])
    .config([
        '$routeProvider', ($routeProvider) => {
            $routeProvider.otherwise({ redirectTo: '/' });
        }
    ]).factory('socket', (socketFactory: any): any => {
        let sock = socketFactory();
        sock.forward('error');
        return sock;
    });