/// <binding />
'use strict';

var gulp = require('gulp'),
    debug = require('gulp-debug'),
    inject = require('gulp-inject'),
    tsc = require('gulp-typescript'),
    tslint = require('gulp-tslint'),
    sourcemaps = require('gulp-sourcemaps'),
    del = require('del'),
    backendConfiguration = require('./gulpfile.config.backend'),
    frontendConfiguration = require('./gulpfile.config.frontend'),
    tsBackendProject = tsc.createProject('tsconfig.json'),
    tsFrontendProject = tsc.createProject('public/app/tsconfig.json'),
    browserSync = require('browser-sync'),
    superstatic = require('superstatic');

var backendConfig = new backendConfiguration();
var frontendConfig = new frontendConfiguration();

var tslintOptions = {
    rulesDirectory: 'node_modules/tslint-microsoft-contrib',
    formatter: 'msbuild',
    emitError: false
}; 

/**
 * Lint all custom TypeScript files.
 */

gulp.task('ts-lint', function () {
    return gulp.src([backendConfig.allTypeScript, frontendConfig.allTypeScript]).pipe(tslint(tslintOptions)).pipe(tslint.report());
});

/**
 * Compile Backend TypeScript and include references to library and app .d.ts files.
 */
gulp.task('compile-ts-backend', function () {
    var sourceTsFiles = [backendConfig.allTypeScript, //path to typescript files
        backendConfig.libraryTypeScriptDefinitions]; //reference to library .d.ts files


    var tsResult = gulp.src(sourceTsFiles)
        .pipe(sourcemaps.init())
        .pipe(tsc(tsBackendProject));

    tsResult.dts.pipe(gulp.dest(backendConfig.tsOutputPath));
    return tsResult.js
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(backendConfig.tsOutputPath));
});

/**
 * Compile Frontend TypeScript and include references to library and app .d.ts files.
 */
gulp.task('compile-ts-frontend', function () {
    var sourceTsFiles = [frontendConfig.allTypeScript, //path to typescript files
        frontendConfig.libraryTypeScriptDefinitions]; //reference to library .d.ts files


    var tsResult = gulp.src(sourceTsFiles)
        .pipe(sourcemaps.init())
        .pipe(tsc(tsFrontendProject));

    tsResult.dts.pipe(gulp.dest(frontendConfig.tsOutputPath));
    return tsResult.js
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(frontendConfig.tsOutputPath));
});

/**
 * Remove all generated JavaScript files from TypeScript compilation.
 */
gulp.task('clean-ts', function (cb) {
    var typeScriptGenFiles = [
        backendConfig.tsOutputPath + '/**/*.js',    // path to all JS files auto gen'd by editor
        backendConfig.tsOutputPath + '/**/*.js.map', // path to all sourcemap files auto gen'd by editor
        frontendConfig.tsOutputPath + '/*.js',
        frontendConfig.tsOutputPath + '/*.js.map',
        '!' + backendConfig.tsOutputPath + '/lib'
    ];

    // delete the files
    del(typeScriptGenFiles, cb);
});

gulp.task('watch', function () {
    gulp.watch([backendConfig.allTypeScript], ['ts-lint', 'compile-ts-backend']);
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

gulp.task('default', ['ts-lint', 'compile-ts-backend', 'compile-ts-frontend']);