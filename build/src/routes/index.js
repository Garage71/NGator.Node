/// <reference path="../../typings/index.d.ts" />
/**
 * Main application router
 */
'use strict';
const rssService = require('../services/services.rsssources');
const express = require('express');
let router = express.Router();
let rss = new rssService.RssSources();
/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('../views/index', { title: 'Express' });
});
router.get('/api/sources', (req, res, next) => {
    res.status(200).json(rss.getRssSources());
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
//# sourceMappingURL=index.js.map