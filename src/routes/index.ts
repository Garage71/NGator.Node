/**
 * Main application router
 */

'use strict';
import * as rssService from '../services/rsssources';
import * as si from '../shared/interfaces';
import * as express from 'express';
import * as newsProvider from '../services/newsprovider';
import {ContentStorage} from '../services/contentstorage';


/// todo: implement Dependency Injection
let router = express.Router();
let rss = new rssService.RssSources();
let news = new newsProvider.NewsProvider();
let cs = ContentStorage;

/* GET home page. */

router.get('/api/sources/logo/:id',
    (req, res, next) => {
        let logoID = req.params['id'];
         cs.getLogo(logoID, (logo) => {
            res.status(200).send(logo);    
        });
    });

router.get('/',
(req, res, next) => {
    res.render('../views/index', { title: 'Express' });
    });

router.get('/api/sources',
    (req, res, next) => {
        res.status(200).json(rss.getRssSources());
    });

router.post('/api/sources', (req, res, next) => {    
    news.getNews(req.body.rssSources, req.body.currentPage, req.body.refresh, (newsFeed: si.INewsHeader[], totalCount: number) => {
        let result: si.INewsHeaders = {
            newsHeaders: newsFeed,
            totalArticlesCount: totalCount
        };
        res.status(200).json(result);
    });
});



export default router;