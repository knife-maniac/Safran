import { CONFIG } from './configuration.js';
import { extract } from './extractor.js';
import { transform } from './transformer.js';
import { load } from './loader.js';


async function main() {
    const { result, fetchedAt, timeToFetchInMs } = await extract(CONFIG.feeds);  // Extract
    const { feeds, items } = transform(result, CONFIG);                          // Transform
    load(JSON.stringify({ fetchedAt, timeToFetchInMs, items, feeds }, null, 2)); // Load
};
main();
