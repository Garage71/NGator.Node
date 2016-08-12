/**
 * Regular expressions helper class
 */

export class Helper {
    private static htmlRegex = /<.*?>/.compile();
    private static quoteRegex = /&.*?/.compile();
    private static divRegex = /<div\b[^>]*>(.*?)<\/div>/.compile();
    private static scriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.compile();

    static STRIPTAGS(text: string): string {
        let stripped = this.htmlRegex[Symbol.replace](text, '');
        return this.quoteRegex[Symbol.replace](stripped, ' ');
    }

    static REMOVEDIVANDSCRPITBLOCKS(text: string): string {
        let undived = this.divRegex[Symbol.replace](text, '');
        return this.scriptRegex[Symbol.replace](undived, '');
    }
}