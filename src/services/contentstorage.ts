/**
 * News content storage service
 * 
*/

import * as si from '../shared/interfaces';

export class ContentStorage {

    private static articleStorage = new Map<string, si.IArticleContainer>();
    private static urlToUuidMap = new Map<string, string>();
    private static enclosureStorage = new Map<string, Buffer>();
    private static logoStorage = new Map<string, Buffer>();

    saveArticle(article: si.IArticleContainer): boolean {
        ContentStorage.articleStorage[article.uuid] = article;
        ContentStorage.urlToUuidMap[article.header.link] = article.uuid;
        return true;
    }

    saveEnclosure(uuid: string, enclosure: Buffer): boolean {
        ContentStorage.enclosureStorage[uuid] = enclosure;
        return true;
    }

    saveLogo(sourceName: string, logo: Buffer): boolean {
        ContentStorage.enclosureStorage[sourceName] = logo;
        return true;
    }

    getArticleByUuid(uuid: string): si.IArticleContainer {
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

    getEnclosureByUuid(uuid: string): Buffer {
        if (ContentStorage.enclosureStorage.has(uuid)) {
            return ContentStorage.enclosureStorage[uuid];
        }
        return null;
    }

    getLogo(sourceName: string): Buffer {
        if (ContentStorage.logoStorage.has(sourceName)) {
            return ContentStorage.logoStorage[sourceName];
        }
        return null;
    }
}

export default ContentStorage;