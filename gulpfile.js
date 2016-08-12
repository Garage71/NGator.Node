/// <binding />
'use strict';

var gulp = require('gulp'),
    debug = require('gulp-debug'),
    inject = require('gulp-inject'),
    tsc = require('gulp-typescript'),
    tslint = require('gulp-tslint'),
    sourcemaps = require('gulp-sourcemaps'),
    del = require('del'),
    serverConfiguration = require('./gulpfile.config'),
    clientConfiguration = require('./gulpfile.config.client'),
    tsProject = tsc.createProject('tsconfig.json'),
    browserSync = require('browser-sync'),
    superstatic = require('superstatic');

var serverConfig = new serverConfiguration();

var tslintOptions = {
    rulesDirectory: 'node_modules/tslint-microsoft-contrib',
    formatter: 'msbuild',
    emitError: false
}; 

/**
 * Lint all custom TypeScript files.
 */

gulp.task('ts-lint', function () {
    return gulp.src(serverConfig.allTypeScript).pipe(tslint(tslintOptions)).pipe(tslint.report());
});

/**
 * Compile TypeScript and include references to library and app .d.ts files.
 */
gulp.task('compile-ts', function () {
    var sourceTsFiles = [serverConfig.allTypeScript, //path to typescript files
        serverConfig.libraryTypeScriptDefinitions]; //reference to library .d.ts files


    var tsResult = gulp.src(sourceTsFiles)
        .pipe(sourcemaps.init())
        .pipe(tsc(tsProject));

    tsResult.dts.pipe(gulp.dest(serverConfig.tsOutputPath));
    return tsResult.js
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(serverConfig.tsOutputPath));
});

/**
 * Remove all generated JavaScript files from TypeScript compilation.
 */
gulp.task('clean-ts', function (cb) {
    var typeScriptGenFiles = [
        serverConfig.tsOutputPath + '/**/*.js',    // path to all JS files auto gen'd by editor
        serverConfig.tsOutputPath + '/**/*.js.map', // path to all sourcemap files auto gen'd by editor
        '!' + config.tsOutputPath + '/lib'
    ];

    // delete the files
    del(typeScriptGenFiles, cb);
});

gulp.task('watch', function () {
    gulp.watch([serverConfig.allTypeScript], ['ts-lint', 'compile-ts']);
});

gulp.task('serve', ['compile-ts', 'watch'], function () {
    process.stdout.write('Starting browserSync and superstatic...\n');
    browserSync({
        port: 3000,
        files: ['index.html', '**/*.js'],
        injectChanges: true,
        logFileChanges: false,
        logLevel: 'silent',
        logPrefix: 'angularin20typescript',
        notify: true,
        reloadDelay: 0,
        server: {
            baseDir: './src',
            middleware: superstatic({ debug: false })
        }
    });
});

gulp.task('default', ['ts-lint', 'compile-ts']);