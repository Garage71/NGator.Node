/**
 * Main application router
 */
'use strict';
const rssService = require('../services/rsssources');
const express = require('express');
const newsProvider = require('../services/newsprovider');
const contentstorage_1 = require('../services/contentstorage');
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