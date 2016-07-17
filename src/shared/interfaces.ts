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