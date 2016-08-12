/**
 * Shared data interfaces used by client and server both
 */

export interface IRSSSource {
    name: string;
    url: string;
    hasLogo: boolean;
}

export interface IRSSSources {
    rsssources: IRSSSource[];
}

export interface INewsHeader {
    title: string;
    link: string;
    description: string;
    publishDate: Date;
    uuid: string;
    source: string;
    hasLogo: boolean;
    hasEnclosure: boolean;
    enclosure: string;
}

export interface INewsHeaders {
    totalArticlesCount: number;
    newsHeaders: INewsHeader[];
}

export interface IArticleContainer {
    uuid: string;
    rssSource: IRSSSource;
    header: INewsHeader;
    body: IBodyContainer;
}

export interface IBodyContainer {
    body: string;
    hasPicture: boolean;
}