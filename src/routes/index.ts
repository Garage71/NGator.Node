/// <reference path="../../typings/index.d.ts" />
/**
 * Main application router
 */

'use strict';
import * as rssService from '../services/services.rsssources';
import * as shared from '../shared/interfaces';
import * as express from 'express';

let router = express.Router();
let rss = new rssService.RssSources();

/* GET home page. */
router.get('/',
(req, res, next) => {
    res.render('../views/index', { title: 'Express' });
    });

router.get('/api/sources',
    (req, res, next) => {
        res.status(200).json(rss.getRssSources());
    });

export default router;