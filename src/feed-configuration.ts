export interface IFeedConfiguration {
    url: string;
    name?: string;
    limitNumberTo?: number;
}

export const FEEDS: IFeedConfiguration[] = [
    // Entertainment
    {
        name: 'XKCD',
        url: 'https://xkcd.com/rss.xml',
        limitNumberTo: 2
    },

    // General news
    {
        name: 'Wikipedia (featured article)',
        url: 'https://en.wikipedia.org/w/api.php?action=featuredfeed&feed=featured&feedformat=rss',
        limitNumberTo: 2
    },
    {
        name: 'BBC',
        url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
        limitNumberTo: 2
    },
    {
        name: 'Ars Technica (general)',
        url: 'https://arstechnica.com/feed/',
        limitNumberTo: 2
    },

    // Technology news
    {
        name: 'Ars Technica (technology)',
        url: 'https://feeds.arstechnica.com/arstechnica/technology-lab',
        limitNumberTo: 2
    },
    {
        name: 'TechCrunch',
        url: 'https://techcrunch.com/feed/',
        limitNumberTo: 2
    },
    {
        name: 'Hacker News',
        url: 'https://hnrss.org/frontpage',
        limitNumberTo: 2
    },
    {
        name: 'Hacker News (best)',
        url: 'https://hnrss.org/best',
        limitNumberTo: 2
    },
    {
        name: 'Sid\'s Blog',
        url: 'https://www.0xsid.com/blog/rss.xml',
        limitNumberTo: 2
    },
    {
        name: 'Anil Dash',
        url: 'https://www.anildash.com/feed.xml',
        limitNumberTo: 2
    },
    {
        name: 'Josh Blais',
        url: 'https://joshblais.com/index.xml',
        limitNumberTo: 2
    },
    {
        name: 'Max van IJsselmuiden',
        url: 'https://www.maxvanijsselmuiden.nl/rss.xml',
        limitNumberTo: 2
    },
    {
        name: 'Minas Karamanis',
        url: 'https://ergosphere.blog/atom.xml',
        limitNumberTo: 2
    },
    {
        name: 'マリウス',
        url: 'https://xn--gckvb8fzb.com/rss',
        limitNumberTo: 2
    }
];
