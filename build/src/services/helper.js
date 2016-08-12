/**
 * Regular expressions helper class
 */
"use strict";
class Helper {
    static STRIPTAGS(text) {
        let stripped = this.htmlRegex[Symbol.replace](text, '');
        return this.quoteRegex[Symbol.replace](stripped, ' ');
    }
    static REMOVEDIVANDSCRPITBLOCKS(text) {
        let undived = this.divRegex[Symbol.replace](text, '');
        return this.scriptRegex[Symbol.replace](undived, '');
    }
}
Helper.htmlRegex = /<.*?>/.compile();
Helper.quoteRegex = /&.*?/.compile();
Helper.divRegex = /<div\b[^>]*>(.*?)<\/div>/.compile();
Helper.scriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.compile();
exports.Helper = Helper;
//# sourceMappingURL=helper.js.map