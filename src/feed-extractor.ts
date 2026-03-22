import Parser from 'rss-parser';

const parser = new Parser();


export type Item = {
    feedIcon: string | null;
    feedTitle: string;

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

async function fetchFeedItems(feedUrl: string): Promise<Item[]> {
    const feed = await parser.parseURL(feedUrl);

    const items: Item[] = (feed.items || []).map((i: any) => {
        return {
            feedIcon: getFeedIcon(feed) ?? getFavicon(feedUrl),
            feedTitle: feed.title ?? '',
            title: i.title ?? '',
            link: i.link ?? i.guid ?? '',
            content: i.contentSnippet ?? i.content ?? '',
            image: getImageFromRaw(i),
            pubDate: i.pubDate ? new Date(i.pubDate).toISOString() : null
        } as Item;
    });
    return items;
}

export async function extract(feedsUrls: string[]): Promise<Item[]> {
    const promises = feedsUrls.map(u => fetchFeedItems(u).catch(err => {
        console.warn('Failed to fetch', u, err?.message || err);
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
