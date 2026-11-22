import { Client } from 'basic-ftp';

import 'dotenv/config';
import fs from 'fs/promises';

import { IAppConfiguration } from './configuration.js';
import { MEDIA_DIR, downloadImages } from './downloader.js';
import { IExtractedItem } from './extractor.js';
import { IFeedTransformationResult } from './transformer.js';


interface IDigest {
    fetchedAt: string;
    timeToFetchInMs: number;
    categories: IAppConfiguration['categories'];
    feeds: IFeedTransformationResult[];
    items: IExtractedItem[];
}


async function saveToFile(content: string): Promise<string> {
    const cwd = process.cwd();
    const path = cwd + '/dist/feed.json';
    await fs.mkdir(cwd + '/dist', { recursive: true });
    await fs.writeFile(path, content);
    return path;
}

async function deployWithFtp(feedPath: string, mediaPath: string): Promise<void> {
    const client = new Client();
    try {
        // Read FTP configuration from environment variables
        const host = process.env.FTP_HOST;
        const user = process.env.FTP_USER;
        const password = process.env.FTP_PASSWORD;
        // FTP_SECURE should be the string 'true' or 'false' in the .env file.
        const secure = ((): boolean => {
            const val = process.env.FTP_SECURE;
            if (!val) return false;
            return val.toLowerCase() === 'true';
        })();
        await client.access({ host, user, password, secure });
        // Upload new images first, so that the feed never references missing ones (ensureDir also moves into the folder)
        await client.ensureDir(`${process.env.FTP_PATH}/${MEDIA_DIR}`);
        const remoteFileNames = (await client.list()).filter(file => file.isFile).map(file => file.name);
        const localFileNames = await fs.readdir(mediaPath);
        for (const fileName of localFileNames.filter(name => !remoteFileNames.includes(name))) {
            await client.uploadFrom(`${mediaPath}/${fileName}`, fileName);
        }
        await client.uploadFrom(feedPath, '../feed.json');
        // Then remove images that are no longer referenced
        for (const fileName of remoteFileNames.filter(name => !localFileNames.includes(name))) {
            await client.remove(fileName);
        }
        console.log('FTP upload successful');
    }
    catch (err) {
        console.log('FTP error:', err);
    }
    client.close();
}


export async function load(digest: IDigest) {
    // Self-host images, so that the viewer does not load them from third parties
    await downloadImages(digest.feeds, digest.items);
    const filePath = await saveToFile(JSON.stringify(digest, null, 2));
    await deployWithFtp(filePath, `${process.cwd()}/dist/${MEDIA_DIR}`);
}
