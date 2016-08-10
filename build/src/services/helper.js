"use strict";
class Helper {
    static stripTags(text) {
        let stripped = this.htmlRegex[Symbol.replace](text, '');
        let unquoted = this.quoteRegex[Symbol.replace](stripped, ' ');
        return unquoted;
    }
    static removeDivAndScriptBlocks(text) {
        let undived = this.divRegex[Symbol.replace](text, '');
        let unscripted = this.scriptRegex[Symbol.replace](undived, '');
        return unscripted;
    }
}
Helper.htmlRegex = /<.*?>/.compile();
Helper.quoteRegex = /&.*?/.compile();
Helper.divRegex = /<div\b[^>]*>(.*?)<\/div>/.compile();
Helper.scriptRegex = new RegExp('(?<startTag><\s*script[^>]*>)(?<content>[\s\S]*?)(?<endTag><\s*/script[^>]*>)').compile();
exports.Helper = Helper;
//# sourceMappingURL=helper.js.map