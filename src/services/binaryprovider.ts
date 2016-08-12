/**
* Simple request wrapper for obtaining of binary streams (pictures)
*
*/

import * as request from 'request';
import {IncomingMessage} from 'http';

export class BinaryProvider {
    static GETBINARYDATA(url: string, callback: (buff: Buffer) => void) : void {
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