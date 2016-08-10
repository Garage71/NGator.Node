﻿/**
 * Main application router
 */

'use strict';
import * as rssService from '../services/rsssources';
import * as si from '../shared/interfaces';
import * as express from 'express';
import * as newsProvider from '../services/newsprovider';
import {ContentStorage} from '../services/contentstorage';
import {AbstractParser} from '../services/parsers/abstractparser';
import {LentaParser} from '../services/parsers/lentaparser';
import {BinaryProvider} from '../services/binaryprovider';

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

router.get('/api/sources/article/:id',
    (req, res, next) => {
        let callback = (art: si.IBodyContainer): void => {
            res.status(200).json(art);            
        }
        let articleID = req.params['id'];
        let article = cs.getArticleByUuid(articleID);
        let parser: AbstractParser = null;
        switch(article.rssSource.name) {
            case 'Lenta.ru':
                parser = new LentaParser(callback);
                break;
            default:
                res.status(404);
        }
        if (parser) {
            parser.parseArticle(article);
        }
    });

router.get('/api/sources/picture/:id',
    (req, res, next) => {
        
        let articleID = req.params['id'];
        let article = cs.getArticleByUuid(articleID);
        if (!article.body.hasPicture && !article.header.hasEnclosure) {
            res.status(404);
            return;
        }
        let picUrl = article.header.enclosure; 
               
        BinaryProvider.getBinaryData(picUrl, (picture) => {
            cs.saveEnclosure(articleID, picture);
        });
        
        cs.getEnclosureByUuid(articleID, (picture) => {
            res.status(200).send(picture);
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