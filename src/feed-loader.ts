import 'dotenv/config';
import { Client } from 'basic-ftp';

import { IExtractorResult } from './feed-extractor.js';


async function saveToFile(extractorResult: IExtractorResult): Promise<string> {
    const fs = await import('fs/promises');
    const cwd = process.cwd();
    const path = cwd + '/dist/feed.json';
    await fs.mkdir(cwd + '/dist', { recursive: true });
    await fs.writeFile(path, JSON.stringify(extractorResult, null, 2));
    return path;
}

async function deployWithFtp(feedPath: string): Promise<void> {
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
        await client.uploadFrom(feedPath, `${process.env.FTP_PATH}/feed.json`);
        console.log('FTP upload successful');
    }
    catch (err) {
        console.log('FTP error:', err);
    }
    client.close();
}


export async function load(extractorResult: IExtractorResult) {
    const filePath = await saveToFile(extractorResult);
    await deployWithFtp(filePath);
}
