﻿'use strict';
var GulpConfigClient = (function () {
    function gulpConfig() {
        //Got tired of scrolling through all the comments so removed them
        //Don't hurt me AC :-)
        this.source = './public/app';
        this.sourceApp = this.source + '.';

        this.tsOutputPath = this.source + './';
        this.allJavaScript = [this.source + '/js/**/*.js'];
        this.allTypeScript = this.sourceApp + '/**/*.ts';

        this.typings = './typings/';
        this.libraryTypeScriptDefinitions = './typings/main/**/*.ts';
    }
    return gulpConfig;
})();
module.exports = GulpConfigClient;