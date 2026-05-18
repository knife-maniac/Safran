import { IAppConfiguration } from './configuration.js';
import { IFeedExtractionResult, IExtractedFeedData, IExtractedItem } from './extractor.js';


export interface IRules {
    maxAgeInHours?: number,
    maxNumberOfItems?: number,
    removeItemsWithTitleIncluding?: string[]
}

interface IFeedTransformationResult {
    error?: string;
    feedData?: IExtractedFeedData;
}

interface ITransformationResult {
    items: IExtractedItem[];
    feeds: IFeedTransformationResult[];
}

function apply(items: IExtractedItem[], rules?: IRules): IExtractedItem[] {
    // Always sort items by date (newest first)
    items.sort((a, b) => {
        if (!a.pubDate || !b.pubDate) {
            return 0; // If either item is missing a pubDate, consider them equal
        }
        return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    });

    // If no rules are provided, return the original (sorted) items list
    if (rules === undefined) {
        return items;
    }

    // Filter by max age
    const maxAgeInHours = rules.maxAgeInHours;
    if (maxAgeInHours !== undefined) {
        const now = new Date();
        items = items.filter(item => {
            if (!item.pubDate) {
                return false;
            }
            const itemDate = new Date(item.pubDate);
            const ageInHours = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60);
            return ageInHours <= maxAgeInHours;
        });
    }

    // Filter by max number of items
    if (rules.maxNumberOfItems !== undefined) {
        items = items.slice(0, rules.maxNumberOfItems);
    }

    // Filter by title
    if (rules.removeItemsWithTitleIncluding !== undefined) {
        items = items.filter(item => {
            if (!item.title) {
                return true;
            }
            return !rules.removeItemsWithTitleIncluding!.some(substring =>
                item.title!.toLowerCase().includes(substring.toLowerCase())
            );
        });
    }

    return items;
}


export function transform(extractedFeeds: IFeedExtractionResult[], config: IAppConfiguration): ITransformationResult {
    let feeds: IFeedTransformationResult[] = [];
    let items: IExtractedItem[] = [];

    extractedFeeds.forEach(({ feedData, error, feedItems }) => {
        if (error || !feedData || !feedItems) {
            console.error(`Error extracting feed '${feedData?.url || 'Unknown URL'}':`, error);
            feeds.push({ error: error || 'Unknown error', feedData });
        } else {
            feeds.push({ feedData });
            items.push(...apply(feedItems, feedData.rules)); // Apply feed-specific rules to items
        }
    });

    // TODO: Group by categories
    // TODO: Apply category-specific rules to items

    // Apply global rules to items
    items = apply(items, config.rules);

    return { items, feeds };
}