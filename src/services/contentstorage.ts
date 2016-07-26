/**
 * News content storage service
 * 
*/

import * as si from '../shared/interfaces';

export class ContentStorage {

    private static articleStorage = new Map<string, si.IArticleContainer>();
    private static urlToUuidMap = new Map<string, string>();

    saveArticle(article: si.IArticleContainer): boolean {
        ContentStorage.articleStorage[article.uuid] = article;
        ContentStorage.urlToUuidMap[article.header.link] = article.uuid;
        return true;
    }

    getArticleByGuid(uuid: string): si.IArticleContainer {
        if (ContentStorage.articleStorage.has(uuid)) {
            return ContentStorage.articleStorage[uuid];
        }
        return null;
    }
        
    getArticlesBySource(source: si.IRSSSource): si.IArticleContainer[] {
        let articles: si.IArticleContainer[] = [];
        ContentStorage.articleStorage.forEach((article) => {
            if (article.header.source === source.name) {
                articles.push(article);
            }
        });
        return articles;
    }
            
    getArticleByUrl(url: string): si.IArticleContainer {
        let uuid = ContentStorage.urlToUuidMap[url];
        if (uuid) {
            return ContentStorage.articleStorage[uuid];
        }
        return null;
    }
}

export default ContentStorage;