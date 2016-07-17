/// <reference path="../../../typings/index.d.ts" />
'user strict';
angular.module('app', ['ngRoute'])
    .config([
    "$routeProvider", ($routeProvider) => {
        $routeProvider.otherwise({ redirectTo: '/' });
    }
]);
//# sourceMappingURL=app.js.map