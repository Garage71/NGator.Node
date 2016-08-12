
export class Helper {
    private static htmlRegex = /<.*?>/.compile();
    private static quoteRegex = /&.*?/.compile();
    private static divRegex = /<div\b[^>]*>(.*?)<\/div>/.compile();
    private static scriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.compile();
    
    static stripTags(text: string): string {
        let stripped = this.htmlRegex[Symbol.replace](text, '');
        let unquoted = this.quoteRegex[Symbol.replace](stripped, ' ');
        return unquoted;
    }

    static removeDivAndScriptBlocks(text: string): string {
        let undived = this.divRegex[Symbol.replace](text, '');
        let unscripted = this.scriptRegex[Symbol.replace](undived, '');
        return unscripted;
    }
}