
import * as request from 'request';
import {IncomingMessage} from 'http';

export class BinaryProvider {
    static getBinaryData(url: string, callback: (buff: Buffer) => void) {
        request.get(url, {
                encoding: null
            }, (err: Error, resp: IncomingMessage, data: Buffer) => {
            if (!err) {
                callback(data);
            } else {
                callback(null);
            }
        });
    }
}