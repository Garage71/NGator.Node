/**
 * News content storage service
 * Implemented using singleton NodeJS pattern
*/
"use strict";
class ContentStorage {
    constructor() {
        this.articleStorage = new Map();
        this.urlToUuidMap = new Map();
        this.enclosureStorage = new Map();
        this.logoStorage = new Map();
        this.callbacksQueue = new Map();
    }
    clear() {
        this.articleStorage.clear();
        this.urlToUuidMap.clear();
        this.enclosureStorage.clear();
        this.logoStorage.clear();
        this.callbacksQueue.clear();
    }
    saveArticle(article) {
        this.articleStorage.set(article.uuid, article);
        this.urlToUuidMap.set(article.header.link, article.uuid);
        return true;
    }
    saveEnclosure(uuid, enclosure) {
        this.enclosureStorage.set(uuid, enclosure);
        let article = this.articleStorage.get(uuid);
        if (article) {
            article.header.hasEnclosure = true;
        }
        let queue = this.callbacksQueue.get(uuid);
        if (queue) {
            let cb;
            cb = queue.pop();
            while (cb) {
                cb(enclosure);
                cb = queue.pop();
            }
        }
    }
    saveLogo(sourceName, logo) {
        this.logoStorage.set(sourceName, logo);
        let queue = this.callbacksQueue.get(sourceName);
        if (queue) {
            let cb;
            cb = queue.pop();
            while (cb) {
                cb(logo);
                cb = queue.pop();
            }
        }
    }
    getArticleByUuid(uuid) {
        if (this.articleStorage.has(uuid)) {
            return this.articleStorage.get(uuid);
        }
        return null;
    }
    getArticlesBySource(source) {
        let articles = [];
        this.articleStorage.forEach((article) => {
            if (article.header.source === source.name) {
                articles.push(article);
            }
        });
        return articles;
    }
    getArticleByUrl(url) {
        let uuid = this.urlToUuidMap.get(url);
        if (uuid) {
            this.articleStorage.get(uuid);
        }
        return null;
    }
    getEnclosureByUuid(uuid, callback) {
        if (this.enclosureStorage.has(uuid)) {
            let pic = this.enclosureStorage.get(uuid);
            callback(pic);
        }
        else {
            let queue = this.callbacksQueue.get(uuid) || [];
            queue.push(callback);
            this.callbacksQueue.set(uuid, queue);
        }
    }
    getLogo(sourceName, callback) {
        if (this.logoStorage.has(sourceName)) {
            let logo = this.logoStorage.get(sourceName);
            callback(logo);
        }
        else {
            let queue = this.callbacksQueue.get(sourceName) || [];
            queue.push(callback);
            this.callbacksQueue.set(sourceName, queue);
        }
    }
}
const CONTENT_STORAGE = Symbol.for('ContentStorage');
let globalSymbols = Object.getOwnPropertySymbols(global);
let hasContentStorage = (globalSymbols.indexOf(CONTENT_STORAGE) > -1);
if (!hasContentStorage) {
    global[CONTENT_STORAGE] = {
        contentStorage: new ContentStorage()
    };
}
let singleton = {
    instance: {
        contentStorage: null
    }
};
let descriptor = {
    get: () => {
        return global[CONTENT_STORAGE];
    }
};
Object.defineProperty(singleton, 'instance', descriptor);
Object.freeze(singleton);
let cs = singleton.instance.contentStorage;
exports.ContentStorage = cs;

//# sourceMappingURL=contentstorage.js.map
