function createItemElement(feed) {
    const li = document.createElement('li');
    li.className = `item ${feed.error ? 'error' : 'success'}`;

    // Header div
    const header = document.createElement('div');
    header.className = 'item-header';

    // Feed home link
    let feedTitleContainer = header;
    if (feed.homeLink) {
        const feedPageLink = document.createElement('a');
        feedPageLink.className = 'feed-home-link';
        feedPageLink.href = feed.homeLink;
        header.appendChild(feedPageLink);
        feedTitleContainer = feedPageLink;
    }

    // Feed icon
    if (feed.icon) {
        let icon = document.createElement('img');
        icon.className = 'feed-icon';
        icon.src = feed.icon;
        icon.alt = feed.name ? `${feed.name} icon` : 'Feed icon';
        feedTitleContainer.appendChild(icon);
        icon.onerror = () => {
            icon.onerror = null;
            feedTitleContainer.removeChild(icon);
        };
    }

    // Feed title
    const feedTitle = document.createElement('span');
    feedTitle.textContent = feed.name || feed.url;
    feedTitle.className = 'feed-title';
    feedTitleContainer.appendChild(feedTitle);

    // Source icon
    let sourceIcon = document.createElement('a');
    sourceIcon.className = 'feed-icon feed-source-icon';
    sourceIcon.href = feed.url;
    sourceIcon.alt = feed.name ? `${feed.name} source icon` : 'Source icon';
    header.appendChild(sourceIcon);
    sourceIcon.onerror = () => {
        sourceIcon.onerror = null;
        header.removeChild(sourceIcon);
    };

    // Append header to list item
    li.appendChild(header);

    // Description
    const description = document.createElement('span');
    description.className = 'description';
    const status = feed.error || `fetched ${feed.numberOfItemsFetched} items (${feed.limitNumberTo} shown)`;
    description.textContent = status;
    li.appendChild(description);

    return li;
}


async function load() {
    const status = document.getElementById('status');
    const list = document.getElementById('items');
    const fetchedEl = document.getElementById('fetched');

    try {
        // Fetch the feed items from the backend API
        // TODO: Use URL configured in .env file
        const res = await fetch('../feed.json', { cache: 'no-store' });
        if (!res.ok) throw new Error(await res.text());

        // Parse the JSON response
        const { feeds, fetchedAt } = await res.json();
        status.textContent = '';
        if (fetchedAt && fetchedEl) {
            fetchedEl.textContent = `Updated ${timeAgo(fetchedAt)}`;
        } else if (fetchedEl) {
            fetchedEl.textContent = '';
        }

        // Create and append list feeds
        feeds.forEach(feed => {
            const li = createItemElement(feed);
            list.appendChild(li);
        });
    } catch (err) {
        status.textContent = 'Failed to load feeds diagnosis';
        console.error(err);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    load(); // Load content
});
