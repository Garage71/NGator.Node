/**
 * Shared data interfaces used by client and server both
 */

export interface IRSSSource {
    name: string;
    url: string;
}

export interface IRSSSources {
    rsssources: IRSSSource[];
}

export interface INewsHeader {
    title: string;
    link: string;
    description: string;
    publishDate: Date;
    guid: string;
    enclosure: number[];
    source: string;
    hasLogo: boolean;
    hasEnclosure: boolean;
}

export interface INewsHeaders {
    totalArticlesCount: number;
    newsHeaders: INewsHeader[];
}