import got from "got";

class ContentUrl {
    readonly domain: string;
    readonly contentId: number;

    constructor(url: string) {
        const parsed = new URL(url);
        this.domain = parsed.hostname;
        
        const pathSegments = parsed.pathname.split("/");
        if (pathSegments.length >= 6) {
            this.contentId = parseInt(pathSegments[5])
        } else {
            throw new Error(`URL path does not look like a Confluence page: ${parsed.pathname}`);
        }
    }

    public get apiUrl() : string {
        return `https://${this.domain}/wiki/rest/api/content/${this.contentId}`
    }
}

export async function getContent(url: string, options: { username: string, password: string }): Promise<any> {
    try {
        return await got.get((new ContentUrl(url)).apiUrl, options).json();
    } catch (e: any) {
        return await e.response.json();
    }
}

export async function putContent(url: string, content: any, options: { username: string, password: string}): Promise<any> {
    try {
        return await got.put((new ContentUrl(url)).apiUrl, { ...options, json: content }).json();
    } catch (e: any) {
        return await e.response.json();
    }
}