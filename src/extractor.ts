import { Feed as ParsedFeed } from '@rowanmanning/feed-parser/lib/feed/base';
import { FeedItem } from '@rowanmanning/feed-parser/lib/feed/item/base';
import { parseFeed } from '@rowanmanning/feed-parser';


export interface IExtractionStatus {
    success: boolean;
    error?: string;
    numberOfItemsFetched: number;
}

interface IFeedData {
    feedUrl: string;
    feedTitle: string;
    feedIcon: string | null;
    feedHomeLink: string;
};

export type IExtractedItem = {
    category?: string;
    title: string;
    link: string;
    pubDate: string | null;
    description?: string;
    image?: string | null;
    score?: number;
};

export interface IFeedExtractionResult {
    extractionStatus: IExtractionStatus;
    feedData?: IFeedData;
    feedItems?: IExtractedItem[];
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


export async function extractFromRSS(url: string): Promise<IFeedExtractionResult> {
    try {
        const response = await fetch(url);
        const parsedFeed: ParsedFeed = parseFeed(await response.text());
        const feedData: IFeedData = {
            feedUrl: url,
            feedTitle: parsedFeed.title ?? '',
            feedIcon: getFeedIcon(parsedFeed, url) ?? '',
            feedHomeLink: parsedFeed.url ?? url ?? ''
        }
        const feedItems: IExtractedItem[] = (parsedFeed.items).map((item: FeedItem) => {
            return {
                title: item.title ?? '',
                link: item.url ?? '',
                description: item.description ?? item.content ?? '',
                image: getImage(item),
                pubDate: item.published ? new Date(item.published).toISOString() : item.updated ? new Date(item.updated).toISOString() : null
            };
        });
        const extractionStatus: IExtractionStatus = {
            success: true,
            numberOfItemsFetched: feedItems.length
        }
        return { extractionStatus, feedData, feedItems };
    } catch (error) {
        const extractionStatus: IExtractionStatus = {
            success: false,
            error: error instanceof Error ? error.message : String(error),
            numberOfItemsFetched: 0
        }
        return { extractionStatus };
    }
}
