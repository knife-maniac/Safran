import { IItem } from './feed-extractor.js';
export interface IFeedConfiguration {
    url: string;
    name?: string;
    limitNumberTo?: number;
    extractor?: (feedConfiguration: IFeedConfiguration) => Promise<IItem[]>
}

export const FEEDS: IFeedConfiguration[] = [
    {
        name: 'Cambridge Analytica',
        url: 'https://cambridgeanalytica.org/feed/'
    },
    {
        name: 'Wikipedia (featured article)',
        url: 'https://en.wikipedia.org/w/api.php?action=featuredfeed&feed=featured&feedformat=rss'
    },
    {
        name: 'XKCD',
        url: 'https://xkcd.com/rss.xml'
    },
    {
        name: 'Ars Technica (general)',
        url: 'https://arstechnica.com/feed/'
    },
    {
        name: 'Ars Technica (technology)',
        url: 'https://feeds.arstechnica.com/arstechnica/technology-lab'
    },
    {
        name: 'TechCrunch',
        url: 'https://techcrunch.com/feed/',
        limitNumberTo: 3
    },
    {
        name: 'HNRSS',
        url: 'https://hnrss.org/frontpage',
        limitNumberTo: 3
    },
    {
        name: 'HNRSS (best)',
        url: 'https://hnrss.org/best',
        limitNumberTo: 3
    },
];
