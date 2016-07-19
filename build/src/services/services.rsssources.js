"use strict";
const nconf = require('nconf');
class RssSources {
    constructor() {
        let provider = nconf.file('appconfig.json');
        this.sources = provider.stores.file.store;
    }
    getRssSources(sites) {
        let result = this.sources;
        if (sites) {
            let filtered = [];
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
exports.RssSources = RssSources;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RssSources;
//# sourceMappingURL=services.rsssources.js.map