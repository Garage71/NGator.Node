/**
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
import {NewsMailRuParser} from '../services/parsers/newsmailruparser';
import {VzRuParser} from '../services/parsers/vzruparser';
import {RegnumParser} from '../services/parsers/regnumparser';
import {NewsRamblerRuParser} from '../services/parsers/newsramblerparser';
import {BinaryProvider} from '../services/binaryprovider';
import app from '../app';

/// todo: implement Dependency Injection
let router = express.Router();
let rss = new rssService.RssSources();
let news = new newsProvider.NewsProvider();
let cs = ContentStorage;

/* GET home page. */

router.get('/api/sources/logo/:id',
    (req, res, next) => {
        let logoID = req.params.id;
         cs.getLogo(logoID, (logo) => {
            res.status(200).send(logo);
        });
    });

router.get('/api/sources/article/:id',
    (req, res, next) => {
        let articleID = req.params.id;
        let article = cs.getArticleByUuid(articleID);
        let callback = (art: si.IBodyContainer): void => {
            article.body = art;
            cs.saveArticle(article);
            res.status(200).json(art);
        };
        if (!article.body.body) {
            let parser: AbstractParser = null;
            let encoding = null;
            switch (article.rssSource.name) {
            case 'Lenta.ru':
                parser = new LentaParser(callback);
                break;
            case 'News.mail.ru':
                parser = new NewsMailRuParser(callback, article.uuid);
                break;
            case 'VZ.ru':
                encoding = 'cp1251';
                parser = new VzRuParser(callback, article.uuid);
                break;
            case 'Regnum':
                parser = new RegnumParser(callback, article.uuid);
                break;
            case 'News.rambler.ru':
                parser = new NewsRamblerRuParser(callback, article.uuid);
                break;
            default:
                res.status(404);
            }
            if (parser) {
                parser.parseArticle(article, encoding);
            }
        } else {
            res.status(200).json(article.body);
        }
    });

router.get('/api/sources/picture/:id',
    (req, res, next) => {

        let articleID = req.params.id;
        let article = cs.getArticleByUuid(articleID);
        if (!article.body.hasPicture && !article.header.hasEnclosure) {
            res.status(404);
            return;
        }
        let picUrl = article.header.enclosure;

        if (picUrl) {
            BinaryProvider.GETBINARYDATA(picUrl,
            (picture) => {
                cs.saveEnclosure(articleID, picture);
            });
        }

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
    news.getNews(req.body.rssSources,
        req.body.currentPage,
        req.body.refresh,
        (newsFeed: si.INewsHeader[], totalCount: number) => {
        let result: si.INewsHeaders = {
            newsHeaders: newsFeed,
            totalArticlesCount: totalCount
        };
        res.status(200).json(result);
        },
        (progress: number) => {
            app.io.emit('progress', progress);
        }
    );
});

export default router;