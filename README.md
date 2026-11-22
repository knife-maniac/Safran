<div align="center">

<img src="public/images/icon.svg" alt="Safran logo" width="96" />

<h1>Safran</h1>

<h3>Your news, on your server, without the scroll.</h3>

<blockquote>
What information consumes is rather obvious: it consumes the attention of its recipients.<br/>
Hence a wealth of information creates a poverty of attention.<br/><br/>
— Herbert A. Simon, 1971
</blockquote>

<br>

[![License: ISC](https://img.shields.io/badge/license-ISC-blue)](LICENSE)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Self-hosted](https://img.shields.io/badge/self--hosted-yes-2ea44f)
![Last commit](https://img.shields.io/github/last-commit/knife-maniac/Safran)

[**The problem**](#the-problem) • [**How Safran answers it**](#how-safran-answers-it) • [**Getting started**](#getting-started) • [**Limitations**](#limitations)

</div>

**Safran** (_**S**elf-hosted **A**ggregator **F**or **R**ss/**A**tom **N**ews_) fetches the RSS and Atom feeds you choose, trims them with your own rules, and publishes a small, finite digest to a static web page you host yourself.

<!-- TODO: replace placeholder with real screenshot -->
<p align="center">
  <img src="sample/screenshot.png" width="800" alt="Safran web viewer showing a digest of news items" />
</p>

## The problem

Today's feeds are built to capture attention, not to inform. Infinite scrolling and instant gratification erode our attention span; opaque algorithms lock us into echo chambers; and behind the scenes, fingerprinting and behavioural metadata are used to map our social networks, build psychographic profiles and sell access to our vulnerabilities, whether to push harmful products or deny needed services.

## How Safran answers it

| Engagement-driven feed    | Safran                                                               |
| :------------------------ | :------------------------------------------------------------------- |
| Infinite scroll           | **Finite batch**: a page that ends                                   |
| Real-time, always "new"   | **Scheduled digest**, delivered asynchronously by cron               |
| Viral, short-form content | **High signal-to-noise**: a few hand-picked sources, capped per feed |
| Opaque ranking algorithm  | **Chronological** order, tagged by topic                             |
| Likes, views, comments    | **Content only**: title, image, link to the source                   |
| Tracking & profiling      | **Self-hosted**: static files and images, no account, no trackers    |

## Getting started

**Requirements:** Node.js 20+ and a web host reachable over FTP(S).

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/knife-maniac/Safran.git && cd Safran
   npm install
   ```
2. Configure your feeds, categories and rules in [`src/configuration.ts`](src/configuration.ts).
3. Add a `.env` file at the root with your FTP settings:
   ```bash
   FTP_HOST=ftp.my-server.com
   FTP_PATH=/path/on/server
   FTP_USER=username
   FTP_PASSWORD=password
   FTP_SECURE=true
   ```
4. Deploy the web viewer, then build and publish a first digest:
   ```bash
   npm run deploy:client   # upload the web viewer (public/), once
   npm run deploy:feed     # build, fetch all feeds and upload feed.json with its images
   ```
5. Schedule the digest with cron (here, every morning at 7:00):
   ```bash
   0 7 * * * cd ~/path/to/Safran && /path/to/node dist/index.js
   ```

If a feed stays silent, check the viewer's **Diagnosis** page (`/diagnosis/`): it lists the status of every feed, broken ones first.

To preview the viewer locally, run `npm run dev` and open http://localhost:8080. It serves [`public/`](public) with the sample digest from [`sample/`](sample); use `npm run dev -- dist` to preview your last real digest instead.

## Limitations

- **FTP only**: the digest and the viewer are deployed over FTP(S). Other targets (local folder, SFTP, S3…) are not supported yet.
- **Rebuild after configuring**: the configuration is written in TypeScript; run `npm run build` (or `npm run deploy:feed`) after editing it.
- **No category rules yet**: categories can declare `rules`, but these are not applied yet.
- **No memory between runs**: each run only sees what the feeds currently publish.
- **Public by default**: anyone who knows your viewer's URL can read your digest.

## License

Safran is released under the [ISC License](LICENSE).
