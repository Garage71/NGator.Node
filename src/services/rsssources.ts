/**
* Rss sources service
*/
import * as sharedInterfaces from '../shared/interfaces';
import * as nconf from 'nconf';

export class RssSources {
        private sources: sharedInterfaces.IRSSSources;
        constructor() {
            let provider = nconf.file('appconfig.json');
            this.sources = provider.stores.file.store as sharedInterfaces.IRSSSources;
        }
        getRssSources(sites?: sharedInterfaces.IRSSSources): sharedInterfaces.IRSSSources {
            let result = this.sources;
            if (sites) {
                let filtered: sharedInterfaces.IRSSSource[] = [];

                for (let site of sites.rsssources) {
                    let ofFiltered = result.rsssources.find(source => source.name === site.name);
                    if (ofFiltered) {
                        filtered.push(ofFiltered);
                    }
                }

                result = {
                    rsssources: filtered
                };
            }
            return result;
        }        
    }

export default RssSources;