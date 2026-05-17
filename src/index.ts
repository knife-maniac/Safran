import { CONFIG } from './configuration.js';
import { extract, IExtractionResult } from './extractor.js';
import { apply } from './rules.js';
import { load } from './loader.js';


async function main() {
    // Extract
    const { result: _result }: IExtractionResult = await extract(CONFIG.feeds);

    // Transform

    // Load
};
main();
