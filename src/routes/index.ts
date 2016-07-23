/// <reference path="../../typings/index.d.ts" />
/**
 * Main application router
 */

'use strict';
import * as rssService from '../services/services.rsssources';
import * as shared from '../shared/interfaces';
import * as express from 'express';
import * as newsProvider from '../services/services.newsprovider';

let router = express.Router();
let rss = new rssService.RssSources();
let news = new newsProvider.NewsProvider();

/* GET home page. */
router.get('/',
(req, res, next) => {
    res.render('../views/index', { title: 'Express' });
    });

router.get('/api/sources',
    (req, res, next) => {
        res.status(200).json(rss.getRssSources());
    });

router.post('/api/sources', (req, res, next) => {
    news.getNews(req.body.rsssources, 1, true);
    res.status(200);
});

export default router;