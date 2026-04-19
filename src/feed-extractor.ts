import { parseFeed } from '@rowanmanning/feed-parser';
import { Feed } from '@rowanmanning/feed-parser/lib/feed/base';
import { FeedItem } from '@rowanmanning/feed-parser/lib/feed/item/base';

import { IFeedConfiguration } from './feed-configuration.js';


export type IItem = {
    feedIcon: string | null;
    feedTitle: string;
    feedConfiguration: IFeedConfiguration
    title: string;
    link: string;
    score?: number;
    description?: string;
    image?: string | null;
    pubDate?: string | null;
};


function getFeedIcon(feed: Feed, feedUrl: string): string | null {
    let feedIcon = feed?.image?.url ?? null;
    if (feedIcon === null) {
        try {
            const url = new URL(feedUrl);
            feedIcon = `${url.origin}/favicon.ico`;
        } catch (err) {
            return null;
        }
    }
    return feedIcon;
}


function getImageFromRaw(text: any): string | null {
    // try to extract first <img> from text
    const match = /<img[^>]+src=["']?([^"' >]+)["']?/i.exec(String(text));
    if (match && match[1]) return match[1];
    return null;
}

function getImage(item: FeedItem): string | null {
    if (!item) return null;
    if (item.image?.url) return item.image.url;
    if (item.media && item.media.length > 0) {
        const media = item.media[0];
        const FILE_TYPE_REGEX = /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i;
        if (media.image && FILE_TYPE_REGEX.test(media.image)) return media.image;
        if (media.url && FILE_TYPE_REGEX.test(media.url)) return media.url;
    }
    // Last ressort: Try to parse item's description and content
    return getImageFromRaw(item.description)
        || getImageFromRaw(item.content)
        || null;
}


async function extractFromRSS(feedConfiguration: IFeedConfiguration): Promise<IItem[]> {
    const response = await fetch(feedConfiguration.url);
    const feed: Feed = parseFeed(await response.text());
    const items: IItem[] = (feed.items).map((item: FeedItem) => {
        return {
            feedConfiguration,
            feedTitle: feedConfiguration.name ?? feed.title ?? '',
            feedIcon: getFeedIcon(feed, feedConfiguration.url),
            title: item.title ?? '',
            link: item.url ?? '',
            description: item.description ?? item.content ?? '',
            image: getImage(item),
            pubDate: item.published ? new Date(item.published).toISOString() : null
        };
    });
    return items;
}


export async function extract(feeds: IFeedConfiguration[]): Promise<IItem[]> {
    const items: IItem[] = [];
    await Promise.all(feeds.map(async feed => {
        try {
            // Checks custom extractor first, then defaults to RSS extractor
            const feedItems = await extractFromRSS(feed);
            items.push(...feedItems);
        } catch (err) {
            console.warn(`Failed to fetch feed '${feed.name}' (${feed.url}) : ${err}`);
        }
    }));

    // sort by pubDate descending when available
    items.sort((a, b) => {
        const ta = a.pubDate ? Date.parse(a.pubDate) : 0;
        const tb = b.pubDate ? Date.parse(b.pubDate) : 0;
        return tb - ta;
    });

    return items;
}
