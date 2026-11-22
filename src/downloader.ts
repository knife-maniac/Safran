import { createHash } from 'crypto';
import fs from 'fs/promises';

import { IExtractedItem } from './extractor.js';
import { IFeedTransformationResult } from './transformer.js';


export const MEDIA_DIR = 'media';
const MAX_IMAGE_SIZE_IN_BYTES = 2 * 1024 * 1024;
const TIMEOUT_IN_MS = 10000;
const EXTENSIONS: Record<string, string> = {
    'image/avif': 'avif',
    'image/gif': 'gif',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/x-icon': 'ico',
    'image/vnd.microsoft.icon': 'ico'
}; // SVG is deliberately not allowed, as it can embed scripts


async function downloadImage(url: string): Promise<string | null> {
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_IN_MS) });
        const contentType = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase() ?? '';
        const extension = EXTENSIONS[contentType];
        if (!response.ok || !extension) {
            throw new Error(`Unexpected response (${response.status}, '${contentType}')`);
        }
        const content = Buffer.from(await response.arrayBuffer());
        if (content.byteLength > MAX_IMAGE_SIZE_IN_BYTES) {
            throw new Error(`Image too large (${content.byteLength} bytes)`);
        }
        // Content-hash file names deduplicate images and let the loader skip already uploaded ones
        const fileName = `${createHash('sha1').update(content).digest('hex')}.${extension}`;
        await fs.writeFile(`dist/${MEDIA_DIR}/${fileName}`, content);
        return `${MEDIA_DIR}/${fileName}`;
    } catch (error) {
        console.warn(`Failed to download image '${url}' : ${error instanceof Error ? error.message : error}`);
        return null;
    }
}

export async function downloadImages(feeds: IFeedTransformationResult[], items: IExtractedItem[]): Promise<void> {
    // Start from an empty folder, so that it only contains images referenced by the feed
    await fs.rm(`dist/${MEDIA_DIR}`, { recursive: true, force: true });
    await fs.mkdir(`dist/${MEDIA_DIR}`, { recursive: true });
    await Promise.all([
        ...feeds.map(async ({ feedData }) => {
            if (feedData?.feedIcon) feedData.feedIcon = await downloadImage(feedData.feedIcon);
        }),
        ...items.map(async item => {
            if (item.image) item.image = await downloadImage(item.image);
        })
    ]);
}
