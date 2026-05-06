function createItemElement(item) {
    const li = document.createElement('li');
    li.className = 'item';

    // Header div
    const header = document.createElement('div');
    header.className = 'item-header';

    // Feed home link
    let feedTitleContainer = header;
    if (item.feedHomeLink !== undefined) {
        const feedPageLink = document.createElement('a');
        feedPageLink.className = 'feed-home-link';
        feedPageLink.href = item.feedHomeLink;
        header.appendChild(feedPageLink);
        feedTitleContainer = feedPageLink;
    }

    // Feed icon (small)
    let icon = document.createElement('img');
    icon.className = 'feed-icon';
    icon.src = item.feedIcon;
    icon.alt = item.feedTitle ? `${item.feedTitle} icon` : 'Feed icon';
    feedTitleContainer.appendChild(icon);
    icon.onerror = () => {
        icon.onerror = null;
        feedTitleContainer.removeChild(icon);
    };

    // Feed title
    const feedTitle = document.createElement('span');
    feedTitle.textContent = item.feedTitle || 'Unknown Feed';
    feedTitle.className = 'feed-title';
    feedTitleContainer.appendChild(feedTitle);

    // Score badge (if score is available)
    if (item.score !== undefined) {
        const scoreBadge = document.createElement('span');
        scoreBadge.textContent = Math.round(item.score);
        scoreBadge.className = 'score-badge';
        header.appendChild(scoreBadge);
    }

    // Source icon (small)
    let sourceIcon = document.createElement('a');
    sourceIcon.className = 'feed-icon feed-source-icon';
    sourceIcon.href = item.feedConfiguration.url;
    sourceIcon.alt = item.feedTitle ? `${item.feedTitle} source icon` : 'Source icon';
    header.appendChild(sourceIcon);
    sourceIcon.onerror = () => {
        sourceIcon.onerror = null;
        header.removeChild(sourceIcon);
    };

    // Append header to list item
    li.appendChild(header);

    // Image
    if (item.image) {
        const image = document.createElement('img');
        image.className = 'thumbnail';
        image.src = item.image;
        image.alt = item.title || '';
        image.onerror = () => { image.onerror = null; }
        image.addEventListener('click', () => {
            showImage(image.src, image.alt);
        });

        li.appendChild(image);
    }

    // Title as a link
    const a = document.createElement('a');
    a.href = item.link || '#';
    a.textContent = item.title || '(no title)';
    a.target = '_blank';
    a.className = 'item-title';
    li.appendChild(a);

    // Description
    if (item.description) {
        const description = document.createElement('span');
        description.className = 'description';
        // Truncate description to ~300 chars for preview
        const txt = String(item.description).replace(/<[^>]+>/g, '');
        description.textContent = txt.length > 300 ? txt.slice(0, 300) + '…' : txt;
        li.appendChild(description);
    }

    // Footer with publication date (shows relative time)
    const footer = document.createElement('div');
    footer.className = 'item-footer';
    if (item.pubDate) {
        footer.textContent = timeAgo(item.pubDate);
    }
    li.appendChild(footer);

    return li;
}

function showImage(src, alt = '') {
    const wrapper = document.getElementById('image-showcase');
    wrapper.classList.add('open');
    const img = wrapper.querySelector('img');
    img.src = src;
    img.alt = alt;
}

function hideShowcase() {
    const wrapper = document.getElementById('image-showcase');
    wrapper.classList.remove('open');
    wrapper.src = '';
    wrapper.alt = '';
}

async function load() {
    const status = document.getElementById('status');
    const list = document.getElementById('items');
    const fetchedEl = document.getElementById('fetched');

    try {
        // Fetch the feed items from the backend API
        // TODO: Use URL configured in .env file
        const res = await fetch('/projects/54fr4n/feed.json', { cache: 'no-store' });
        if (!res.ok) throw new Error(await res.text());

        // Parse the JSON response
        const { items, fetchedAt } = await res.json();
        status.textContent = '';
        if (fetchedAt && fetchedEl) {
            fetchedEl.textContent = `Updated ${timeAgo(fetchedAt)}`;
        } else if (fetchedEl) {
            fetchedEl.textContent = '';
        }

        // Create and append list items for each feed item
        items.forEach(it => {
            const li = createItemElement(it);
            list.appendChild(li);
        });
    } catch (err) {
        status.textContent = 'Failed to load feed items';
        console.error(err);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    // clicking the backdrop or image closes the showcase
    const wrapper = document.getElementById('image-showcase');
    wrapper.addEventListener('click', () => hideShowcase());

    // allow Escape to close showcase
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') hideShowcase();
    });

    // Load content
    load();
});
