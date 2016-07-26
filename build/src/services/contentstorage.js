/**
 * News content storage service
 *
*/
"use strict";
class ContentStorage {
    saveArticle(article) {
        ContentStorage.articleStorage[article.uuid] = article;
        ContentStorage.urlToUuidMap[article.header.link] = article.uuid;
        return true;
    }
    getArticleByGuid(uuid) {
        if (ContentStorage.articleStorage.has(uuid)) {
            return ContentStorage.articleStorage[uuid];
        }
        return null;
    }
    getArticlesBySource(source) {
        let articles = [];
        ContentStorage.articleStorage.forEach((article) => {
            if (article.header.source === source.name) {
                articles.push(article);
            }
        });
        return articles;
    }
    getArticleByUrl(url) {
        let uuid = ContentStorage.urlToUuidMap[url];
        if (uuid) {
            return ContentStorage.articleStorage[uuid];
        }
        return null;
    }
}
ContentStorage.articleStorage = new Map();
ContentStorage.urlToUuidMap = new Map();
exports.ContentStorage = ContentStorage;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ContentStorage;
//# sourceMappingURL=contentstorage.js.map