import { Feed as ParsedFeed } from '@rowanmanning/feed-parser/lib/feed/base';
import { FeedItem } from '@rowanmanning/feed-parser/lib/feed/item/base';
import { parseFeed } from '@rowanmanning/feed-parser';

import { IFeedConfiguration } from './configuration';


export interface IExtractedFeedData extends IFeedConfiguration {
    feedTitle?: string;
    feedIcon?: string | null;
    feedHomeLink?: string;
};

export type IExtractedItem = {
    feedUrl: string;
    category?: string;
    title: string;
    link: string;
    pubDate: string | null;
    description?: string;
    image?: string | null;
    score?: number;
};

export interface IFeedExtractionResult {
    error?: string;
    feedData?: IExtractedFeedData;
    feedItems?: IExtractedItem[];
}

export interface IExtractionResult {
    fetchedAt: string;
    timeToFetchInMs: number;
    data: IFeedExtractionResult[];
}


function getFeedIcon(feed: ParsedFeed, feedUrl: string): string | null {
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


export async function extractFeed(feed: IFeedConfiguration): Promise<IFeedExtractionResult> {
    try {
        const response = await fetch(feed.url);
        const parsedFeed: ParsedFeed = parseFeed(await response.text());
        const feedData: IExtractedFeedData = {
            ...feed,
            feedTitle: parsedFeed.title ?? '',
            feedIcon: getFeedIcon(parsedFeed, feed.url) ?? '',
            feedHomeLink: parsedFeed.url ?? feed.url ?? ''
        }
        const feedItems: IExtractedItem[] = (parsedFeed.items).map((item: FeedItem) => {
            return {
                feedUrl: feed.url,
                title: item.title ?? '',
                link: item.url ?? '',
                description: item.description ?? item.content ?? '',
                image: getImage(item),
                pubDate: item.published ? new Date(item.published).toISOString() : item.updated ? new Date(item.updated).toISOString() : null
            };
        });
        return { feedData, feedItems };
    } catch (error) {
        return { feedData: { ...feed }, error: error instanceof Error ? error.message : String(error) };
    }
}

export async function extract(feeds: IFeedConfiguration[]): Promise<IExtractionResult> {
    const data: IFeedExtractionResult[] = [];
    const fetchedAt = new Date().toISOString();
    const startTime = Date.now(); // Time how long it takes to extract all feeds
    await Promise.all(feeds.map(async feed => {
        console.log(`Extracting feed '${feed.name}...'`);
        const { error,feedData, feedItems } = await extractFeed(feed);
        //TODO: Merge feed info from config and from extraction
        if (error || feedItems === undefined) {
            data.push({ feedData, error: `Failed to fetch feed '${feed.name}' (${feed.url}) : ${error || 'Unknown error'}` });
            console.warn(`Failed to fetch feed '${feed.name}' (${feed.url}) : ${error}`);
        } else if (feedItems) {
            data.push({ feedData, feedItems });
            console.log(`Extracted ${feedItems.length} items from feed '${feed.name}'`);
        }
    }));
    const endTime = Date.now();
    const timeToFetchInMs = endTime - startTime;
    return { data, fetchedAt, timeToFetchInMs };
}