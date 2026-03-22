import Parser from 'rss-parser';
import { feedConfiguration } from './feed-configuration';

const parser = new Parser();


export type Item = {
    feedIcon: string | null;
    feedTitle: string;
    feedConfiguration: feedConfiguration

    title: string;
    link: string;
    score?: number;

    content?: string;
    image?: string | null;
    pubDate?: string | null;
};


function getImageFromRaw(i: any): string | null {
    // Check common fields first
    if (!i) return null;
    // enclosure (common RSS field)
    if (i.enclosure && typeof i.enclosure === 'object' && i.enclosure.url) return String(i.enclosure.url);
    // media:content or media:thumbnail
    if (i['media:content'] && i['media:content']['$'] && i['media:content']['$'].url) return String(i['media:content']['$'].url);
    if (i['media:thumbnail'] && i['media:thumbnail'].url) return String(i['media:thumbnail'].url);
    if (i['media:thumbnail'] && i['media:thumbnail']['$'] && i['media:thumbnail']['$'].url) return String(i['media:thumbnail']['$'].url);
    // itunes image
    if (i['itunes:image'] && (i['itunes:image'].href || i['itunes:image'].url)) return String(i['itunes:image'].href ?? i['itunes:image'].url);
    // some parsers put image on item.image
    if (i.image && (i.image.url || i.image)) return String(i.image.url ?? i.image);
    // try to extract first <img> from content or content:encoded
    const html = i.content || i['content:encoded'] || i.summary || i.description || '';
    const m = /<img[^>]+src=["']?([^"' >]+)["']?/i.exec(String(html));
    if (m && m[1]) return m[1];
    return null;
}

function getFeedIcon(feed: any) {
    return feed?.image?.url ?? feed?.image ?? feed?.['itunes:image']?.href ?? feed?.['itunes:image']?.url ?? null;
}

function getFavicon(rawUrl: string): string | null {
    try {
        const url = new URL(rawUrl);
        return `${url.origin}/favicon.ico`;
    } catch (err) {
        return null;
    }
}

async function fetchFeedItems(feed: feedConfiguration): Promise<Item[]> {
    const result = await parser.parseURL(feed.url);
    const items: Item[] = (result.items || []).map((i: any) => {
        return {
            feedIcon: getFeedIcon(result) ?? getFavicon(feed.url),
            feedTitle: feed.name ?? result.title ?? '',
            feedConfiguration: feed,
            title: i.title ?? '',
            link: i.link ?? i.guid ?? '',
            content: i.contentSnippet ?? i.content ?? '',
            image: getImageFromRaw(i),
            pubDate: i.pubDate ? new Date(i.pubDate).toISOString() : null
        } as Item;
    });
    return items;
}

export async function extract(feeds: feedConfiguration[]): Promise<Item[]> {
    const promises = feeds.map(f => fetchFeedItems(f).catch(err => {
        console.warn(`Failed to fetch feed '${f.name}' (${f.url}) : ${err?.message || err}`);
        return [] as Item[];
    }));
    const results = await Promise.all(promises);
    const combined = results.flat();
    // sort by pubDate descending when available
    combined.sort((a, b) => {
        const ta = a.pubDate ? Date.parse(a.pubDate) : 0;
        const tb = b.pubDate ? Date.parse(b.pubDate) : 0;
        return tb - ta;
    });
    return combined;
}
