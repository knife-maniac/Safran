import { IRules } from './transformer';


export interface IAppConfiguration {
    name: string,
    feeds: IFeedConfiguration[],
    categories?: IFeedCategory[],
    rules?: IRules
}

export interface IFeedConfiguration {
    url: string,
    name?: string,
    categoryName?: string,
    rules?: IRules
}

interface IFeedCategory {
    name: string,
    color?: string,
    rules?: IRules
}


export const CONFIG: IAppConfiguration = {
    name: 'safran',
    rules: { // These rules are applied to all items
        maxAgeInHours: 36
    },
    categories: [
        {
            name: 'Entertainment',
            color: 'red',
            rules: { // Rules are apply to all items from feed in the "Entertainment" category
                removeItemsWithTitleIncluding: ['war', 'football', 'politics']
            },
        },
        {
            name: 'General News',
            color: 'blue'
        },
        {
            name: 'Technology News',
            color: 'yellow'
        }
    ],
    feeds: [
        // Entertainment
        {
            name: 'XKCD',
            url: 'https://xkcd.com/rss.xml',
            rules: { // These rules are applied only to items from this feed
                maxNumberOfItems: 2
            },
            categoryName: 'Entertainment'
        },

        // General News
        {
            name: 'Wikipedia (featured article)',
            url: 'https://en.wikipedia.org/w/api.php?action=featuredfeed&feed=featured&feedformat=rss',
            rules: {
                maxNumberOfItems: 2
            },
            categoryName: 'General News'
        },
        {
            name: 'BBC',
            url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
            rules: {
                maxNumberOfItems: 2
            },
            categoryName: 'General News'
        },
        {
            name: 'Ars Technica (general)',
            url: 'https://arstechnica.com/feed/',
            rules: {
                maxNumberOfItems: 2
            },
            categoryName: 'General News'
        },


        // Technology News
        {
            name: 'Ars Technica (technology)',
            url: 'https://feeds.arstechnica.com/arstechnica/technology-lab',
            rules: {
                maxNumberOfItems: 2
            },
            categoryName: 'Technology news'
        },
        {
            name: 'TechCrunch',
            url: 'https://techcrunch.com/feed/',
            rules: {
                maxNumberOfItems: 2
            },
            categoryName: 'Technology news'
        },
        {
            name: 'Hacker News',
            url: 'https://hnrss.org/frontpage',
            rules: {
                maxNumberOfItems: 2
            },
            categoryName: 'Technology news'
        },
        {
            name: 'Hacker News (best)',
            url: 'https://hnrss.org/best',
            rules: {
                maxNumberOfItems: 2
            },
            categoryName: 'Technology news'
        },

        // Non-categorized feeds
        {
            name: 'Sid\'s Blog',
            url: 'https://www.0xsid.com/blog/rss.xml',
            rules: {
                maxNumberOfItems: 2
            }
        },
        {
            name: 'Anil Dash',
            url: 'https://www.anildash.com/feed.xml',
            rules: {
                maxNumberOfItems: 2
            }
        },
        {
            name: 'Josh Blais',
            url: 'https://joshblais.com/index.xml',
            rules: {
                maxNumberOfItems: 2
            }
        },
        {
            name: 'Max van IJsselmuiden',
            url: 'https://www.maxvanijsselmuiden.nl/rss.xml',
            rules: {
                maxNumberOfItems: 2
            }
        },
        {
            name: 'Minas Karamanis',
            url: 'https://ergosphere.blog/atom.xml',
            rules: {
                maxNumberOfItems: 2
            }
        },
        {
            name: 'マリウス',
            url: 'https://xn--gckvb8fzb.com/rss',
            rules: {
                maxNumberOfItems: 2
            }
        }
    ]
};
