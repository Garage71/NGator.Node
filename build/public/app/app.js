/// <reference path="../../typings/index.d.ts" />
'user strict';
angular.module('app', ['ngRoute', 'ui.select', 'ngSanitize', 'ngAnimate', 'ui.bootstrap'])
    .config([
    '$routeProvider', ($routeProvider) => {
        $routeProvider.otherwise({ redirectTo: '/' });
    }
]);
//# sourceMappingURL=app.js.map