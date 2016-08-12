/**
* app: main application module
*/

/// <reference path="../typings/index.d.ts" />
import * as express from'express';
import * as path from 'path';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as routes from './routes/index';

interface IPipelineError extends Error {
    name: string;
    message: string;
    stack: string;
    status: number;
}

//import * as users from './routes/users';

let app = express();

// view engine setup
app.set('views', path.join(__dirname, '../../views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
 app.use(express.static(path.join(__dirname, '../../public')));

app.use('/', routes.default);
//app.use('/users', users);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    let err = new Error('Not Found');
    let pipelineError: IPipelineError = {
        name: err.name,
        status: 404,
        message: err.message,
        stack: err.stack
    };
    next(pipelineError);
});


// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use((err: IPipelineError, req: express.Request, res: express.Response, next: any) => {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use((err: IPipelineError, req: express.Request, res: express.Response, next: any) => {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


export default app;
