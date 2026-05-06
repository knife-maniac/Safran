import { parseFeed } from '@rowanmanning/feed-parser';
import { Feed } from '@rowanmanning/feed-parser/lib/feed/base';
import { FeedItem } from '@rowanmanning/feed-parser/lib/feed/item/base';

import { IFeedConfiguration } from './feed-configuration.js';


export type IItem = {
    feedIcon: string | null;
    feedTitle: string;
    feedHomeLink: string;
    feedConfiguration: IFeedConfiguration;
    title: string;
    link: string;
    score?: number;
    description?: string;
    image?: string | null;
    pubDate?: string | null;
};

export interface IFeedDiagnosis extends IFeedConfiguration {
    numberOfItemsFetched: number;
    error?: string;
}

export type IExtractorResult = {
    fetchedAt: string,
    items: IItem[];
    feeds: IFeedDiagnosis[];
}


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
            feedHomeLink: feed.url ?? '',
            title: item.title ?? '',
            link: item.url ?? '',
            description: item.description ?? item.content ?? '',
            image: getImage(item),
            pubDate: item.published ? new Date(item.published).toISOString() : item.updated ? new Date(item.updated).toISOString() : null
        };
    });
    return items;
}


export async function extract(feedsConfigurations: IFeedConfiguration[]): Promise<IExtractorResult> {
    const items: IItem[] = [];
    const feeds: IFeedDiagnosis[] = [];
    const fetchedAt = new Date().toISOString();
    await Promise.all(feedsConfigurations.map(async feedConfiguration => {
        try {
            console.log(`Extracting feed '${feedConfiguration.name}...'`);
            const feedItems = await extractFromRSS(feedConfiguration);
            console.log(`Extracted ${feedItems.length} items from feed '${feedConfiguration.name}'`);
            items.push(...feedItems);
            feeds.push({ ...feedConfiguration, numberOfItemsFetched: feedItems.length });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.warn(`Failed to fetch feed '${feedConfiguration.name}' (${feedConfiguration.url}) : ${errorMessage}`);
            feeds.push({ ...feedConfiguration, numberOfItemsFetched: 0, error: errorMessage });
        }
    }));
    return { fetchedAt, items, feeds };
}
