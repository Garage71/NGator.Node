/**
 * News content storage service
 * 
*/

import * as si from '../shared/interfaces';

class ContentStorage {
    private articleStorage = new Map<string, si.IArticleContainer>();
    private urlToUuidMap = new Map<string, string>();
    private enclosureStorage = new Map<string, Buffer>();
    private logoStorage = new Map<string, Buffer>();
    private callbacksQueue = new Map<string, ((data: Buffer) => void)[]>();
       
    saveArticle(article: si.IArticleContainer): boolean {
        this.articleStorage.set(article.uuid, article);
        this.urlToUuidMap.set(article.header.link, article.uuid);
        return true;
    }

    saveEnclosure(uuid: string, enclosure: Buffer): boolean {
        this.enclosureStorage.set(uuid, enclosure);
        return true;
    }

    saveLogo(sourceName: string, logo: Buffer): void {
        this.logoStorage.set(sourceName, logo);
        let queue = this.callbacksQueue.get(sourceName);
        if (queue) {
            let cb: (data: Buffer) => void;
            cb = queue.pop();
            while (cb) {
                cb(logo);
                cb = queue.pop();
            }
        }
    }

    getArticleByUuid(uuid: string): si.IArticleContainer {
        if (this.articleStorage.has(uuid)) {
            return this.articleStorage.get(uuid);
        }
        return null;
    }
         
    getArticlesBySource(source: si.IRSSSource): si.IArticleContainer[] {
        let articles: si.IArticleContainer[] = [];
        this.articleStorage.forEach((article) => {
            if(article.header.source === source.name) {
                articles.push(article);
            }
        });        
        return articles;
    }
            
    getArticleByUrl(url: string): si.IArticleContainer {
        let uuid = this.urlToUuidMap.get(url);
        if (uuid) {this.articleStorage.get(uuid);
        }
        return null;
    }

    getEnclosureByUuid(uuid: string): Buffer {
        return this.enclosureStorage.get(uuid);
    }

    getLogo(sourceName: string, callback: (data: Buffer) => void): void {
        if (this.logoStorage.has(sourceName)) {
            let logo = this.logoStorage.get(sourceName);
            callback(logo);
        } else {
            let queue = this.callbacksQueue.get(sourceName) || [];
            queue.push(callback);
            this.callbacksQueue.set(sourceName, queue);
        }
    }
}

interface IContentStorageInstance {
    instance: {
        contentStorage: ContentStorage;
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

let singleton: IContentStorageInstance = {
    instance: {
        contentStorage: null
    }
};

let descriptor: PropertyDescriptor = {
    get: (): any => {
        return global[CONTENT_STORAGE];
    }
};

Object.defineProperty(singleton, 'instance', descriptor);

Object.freeze(singleton);

let cs = singleton.instance.contentStorage;
export {cs as ContentStorage}