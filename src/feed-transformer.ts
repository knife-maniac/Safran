import { IItem } from './feed-extractor.js';


export function transform(items: IItem[]): IItem[] {
    return items

        // Remove duplicate items (URL is used as a unique identifier)
        .filter((item, index, self) => {
            return index === self.findIndex((t) => t.link === item.link);
        })

        // Limit items to the last 36 hours (and remove items without a pubDate or with a pubDate in the future)
        .reduce((acc, item) => {
            if (item.pubDate) {
                const ageInHours = (Date.now() - Date.parse(item.pubDate)) / (1000 * 60 * 60);
                if (ageInHours <= 36 && ageInHours >= 0) {
                    acc.push(item);
                }
            }
            return acc;
        }, [] as IItem[])

        // Limit number of items from each feed according to its own configuration
        .reduce((acc, item) => {
            const sourceItems = acc.filter((i) => i.feedTitle === item.feedTitle);
            const limitNumberTo = item.feedConfiguration.limitNumberTo;
            if (!limitNumberTo || sourceItems.length < limitNumberTo) {
                acc.push(item);
            }
            return acc;
        }, [] as IItem[]);
}
