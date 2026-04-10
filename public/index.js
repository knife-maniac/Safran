function timeAgo(dateAsString) {
    const date = new Date(dateAsString);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
    const years = Math.floor(months / 12);
    return `${years} year${years === 1 ? '' : 's'} ago`;
}

function createItemElement(item) {
    const li = document.createElement('li');
    li.className = 'item';

    // Header div with feed icon, feed title and score
    const header = document.createElement('div');
    header.className = 'item-header';

    // Feed icon (small)
    const icon = document.createElement('img');
    icon.className = 'feed-icon';
    icon.src = item.feedIcon;
    icon.alt = item.feedTitle ? `${item.feedTitle} icon` : 'Feed icon';
    icon.onerror = () => { icon.onerror = null; };
    header.appendChild(icon);

    // Feed title
    const feedTitle = document.createElement('span');
    feedTitle.textContent = item.feedTitle || 'Unknown Feed';
    feedTitle.className = 'feed-title';
    header.appendChild(feedTitle);

    // Score badge (if score is available)
    if (item.score !== undefined) {
        const scoreBadge = document.createElement('span');
        scoreBadge.textContent = Math.round(item.score);
        scoreBadge.className = 'score-badge';
        header.appendChild(scoreBadge);
    }

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
        const res = await fetch('/projects/safran/feed.json', { cache: 'no-store' });
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
        status.textContent = 'Failed to load feeds';
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
