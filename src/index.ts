import { CONFIG } from './configuration.js';
import { extract } from './extractor.js';
import { transform } from './transformer.js';
import { load } from './loader.js';


async function main() {
    // Extract
    const { data, fetchedAt, timeToFetchInMs } = await extract(CONFIG.feeds);

    // Transform
    const { feeds, items } = transform(data, CONFIG);

    // Load
    load({
        fetchedAt,
        timeToFetchInMs,
        categories: CONFIG.categories,
        feeds,
        items
    });
};
main();
