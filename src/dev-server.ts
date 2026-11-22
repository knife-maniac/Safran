import fs from 'fs/promises';
import http from 'http';
import path from 'path';


const PORT = Number(process.env.PORT) || 8080;
const PUBLIC_DIR = path.resolve('public');
// Folder holding feed.json and media/: the committed sample by default, or e.g. `dist` for the last real run
const DIGEST_DIR = path.resolve(process.argv[2] || 'sample');
const CONTENT_TYPES: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.ttf': 'font/ttf'
};


// Serves the viewer like the FTP host would, with the digest taken from DIGEST_DIR
const server = http.createServer(async (req, res) => {
    let urlPath = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname);
    if (urlPath.endsWith('/')) urlPath += 'index.html';
    const isDigest = urlPath === '/feed.json' || urlPath.startsWith('/media/');
    const rootDir = isDigest ? DIGEST_DIR : PUBLIC_DIR;
    const filePath = path.join(rootDir, urlPath);
    try {
        if (!filePath.startsWith(rootDir + path.sep)) throw new Error('Forbidden path');
        const content = await fs.readFile(filePath);
        res.writeHead(200, {
            'Content-Type': CONTENT_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
            'Cache-Control': 'no-store'
        });
        res.end(content);
    } catch {
        res.writeHead(404).end('Not found');
    }
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`Viewer:    http://localhost:${PORT}/`);
    console.log(`Diagnosis: http://localhost:${PORT}/diagnosis/`);
    console.log(`Digest from ${DIGEST_DIR}`);
});
