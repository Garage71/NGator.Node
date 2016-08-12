/**
 * Main application router
 */
'use strict';
const rssService = require('../services/rsssources');
const express = require('express');
const newsProvider = require('../services/newsprovider');
const contentstorage_1 = require('../services/contentstorage');
const lentaparser_1 = require('../services/parsers/lentaparser');
const newsmailruparser_1 = require('../services/parsers/newsmailruparser');
const vzruparser_1 = require('../services/parsers/vzruparser');
const binaryprovider_1 = require('../services/binaryprovider');
/// todo: implement Dependency Injection
let router = express.Router();
let rss = new rssService.RssSources();
let news = new newsProvider.NewsProvider();
let cs = contentstorage_1.ContentStorage;
/* GET home page. */
router.get('/api/sources/logo/:id', (req, res, next) => {
    let logoID = req.params['id'];
    cs.getLogo(logoID, (logo) => {
        res.status(200).send(logo);
    });
});
router.get('/api/sources/article/:id', (req, res, next) => {
    let callback = (art) => {
        res.status(200).json(art);
    };
    let articleID = req.params['id'];
    let article = cs.getArticleByUuid(articleID);
    let parser = null;
    let encoding = null;
    switch (article.rssSource.name) {
        case 'Lenta.ru':
            parser = new lentaparser_1.LentaParser(callback);
            break;
        case 'News.mail.ru':
            parser = new newsmailruparser_1.NewsMailRuParser(callback, article.uuid);
            break;
        case 'VZ.ru':
            encoding = 'cp1251';
            parser = new vzruparser_1.VzRuParser(callback, article.uuid);
            break;
        default:
            res.status(404);
    }
    if (parser) {
        parser.parseArticle(article, encoding);
    }
});
router.get('/api/sources/picture/:id', (req, res, next) => {
    let articleID = req.params['id'];
    let article = cs.getArticleByUuid(articleID);
    if (!article.body.hasPicture && !article.header.hasEnclosure) {
        res.status(404);
        return;
    }
    let picUrl = article.header.enclosure;
    if (picUrl) {
        binaryprovider_1.BinaryProvider.getBinaryData(picUrl, (picture) => {
            cs.saveEnclosure(articleID, picture);
        });
    }
    cs.getEnclosureByUuid(articleID, (picture) => {
        res.status(200).send(picture);
    });
});
router.get('/', (req, res, next) => {
    res.render('../views/index', { title: 'Express' });
});
router.get('/api/sources', (req, res, next) => {
    res.status(200).json(rss.getRssSources());
});
router.post('/api/sources', (req, res, next) => {
    news.getNews(req.body.rssSources, req.body.currentPage, req.body.refresh, (newsFeed, totalCount) => {
        let result = {
            newsHeaders: newsFeed,
            totalArticlesCount: totalCount
        };
        res.status(200).json(result);
    });
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
//# sourceMappingURL=index.js.map