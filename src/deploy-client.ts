import { Client } from 'basic-ftp';

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';


// Load .env from project root
dotenv.config();


const FTP_HOST = process.env.FTP_HOST;
const FTP_USER = process.env.FTP_USER;
const FTP_PASSWORD = process.env.FTP_PASSWORD;
const FTP_PATH = process.env.FTP_PATH || '/';
const FTP_SECURE = (process.env.FTP_SECURE || 'false').toLowerCase() === 'true';

if (!FTP_HOST || !FTP_USER) {
    console.error('Missing FTP_HOST or FTP_USER in environment. Aborting.');
    process.exit(1);
}

const publicDir = path.resolve(process.cwd(), 'public');

async function uploadDirectory(client: Client, localDir: string, remoteDir: string) {
    const entries = await fs.promises.readdir(localDir, { withFileTypes: true });

    // Ensure remoteDir exists
    await client.ensureDir(remoteDir);

    try {
        for (const entry of entries) {
            const localPath = path.join(localDir, entry.name);

            if (entry.isDirectory()) {
                // recurse into child directory (remote child is entry.name relative to current)
                await uploadDirectory(client, localPath, entry.name);
            } else if (entry.isFile()) {
                console.log(`Uploading ${localPath} -> ${path.posix.join(remoteDir, entry.name)}`);
                // upload file using basename while in the target remote dir
                await client.uploadFrom(localPath, entry.name);
            }
        }
    } finally {
        await client.cdup();
        // go back to parent directory
    }
}

async function main() {
    // Create FTP client
    const client = new Client();
    client.ftp.verbose = true;

    try {
        // Connect to FTP host
        await client.access({ host: FTP_HOST, user: FTP_USER, password: FTP_PASSWORD, secure: FTP_SECURE });
        console.log('Connected to FTP host', FTP_HOST);

        // Change to base path
        if (FTP_PATH && FTP_PATH !== '/') {
            // Ensure starting from root (ensureDir will change into it)
            await client.ensureDir(FTP_PATH);
        }

        // Upload public directory contents
        const entries = await fs.promises.readdir(publicDir, { withFileTypes: true });
        for (const entry of entries) {
            const localPath = path.join(publicDir, entry.name);
            if (entry.isDirectory()) {
                await uploadDirectory(client, localPath, entry.name);
            } else if (entry.isFile()) {
                console.log(`Uploading ${localPath} -> ${path.posix.join(FTP_PATH, entry.name)}`);
                await client.uploadFrom(localPath, entry.name);
            }
        }

        console.log('Upload complete');
    } catch (err) {
        console.error('Deployment failed:', err);
        process.exitCode = 2;
    } finally {
        client.close();
    }
}
main();
