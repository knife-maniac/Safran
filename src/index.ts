import { CONFIG } from './configuration.js';
import { extract, IExtractedFeedData, IExtractedItem, IExtractionResult } from './extractor.js';
import { apply } from './rules.js';
import { load } from './loader.js';


async function main() {
    // Extract
    const { result }: IExtractionResult = await extract(CONFIG.feeds);

    // Transform
    let feeds: IExtractedFeedData[] = [];
    let items: IExtractedItem[] = [];

    result.forEach(({ error, feedData, feedItems }) => {
        if (error || !feedData || !feedItems) {
            console.error(`Error extracting feed '${feedData?.feedTitle || 'Unknown'}':`, error);
        } else {
            feeds.push(feedData);
            items.push(...apply(feedItems,)); // Apply feed-specific rules to items
        }
    });

    // TODO: Group by categories
    // TODO: Apply category-specific rules to items

    // Apply global rules to items
    items = apply(items, CONFIG.rules);

    // Load
    load(JSON.stringify({ items, feeds }, null, 2));
};
main();
