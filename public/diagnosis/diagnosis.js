function createFeedElement(feedData, error) {
    const li = document.createElement('li');
    li.className = `item ${error ? 'error' : 'success'}`;

    // Header div
    const header = document.createElement('div');
    header.className = 'item-header';

    // Feed home link
    let feedTitleContainer = header;
    if (feedData.homeLink) {
        const feedPageLink = document.createElement('a');
        feedPageLink.className = 'feed-home-link';
        feedPageLink.href = feedData.homeLink;
        header.appendChild(feedPageLink);
        feedTitleContainer = feedPageLink;
    }

    // Feed icon
    if (feedData.feedIcon) {
        let icon = document.createElement('img');
        icon.className = 'feed-icon';
        icon.src = feedData.feedIcon;
        icon.alt = feedData.name ? `${feedData.name} icon` : 'Feed icon';
        feedTitleContainer.appendChild(icon);
        icon.onerror = () => {
            icon.onerror = null;
            feedTitleContainer.removeChild(icon);
        };
    }

    // Feed title
    const feedTitle = document.createElement('span');
    feedTitle.textContent = feedData.name || feedData.url;
    feedTitle.className = 'feed-title';
    feedTitleContainer.appendChild(feedTitle);

    // Source icon
    let sourceIcon = document.createElement('a');
    sourceIcon.className = 'feed-icon feed-source-icon';
    sourceIcon.href = feedData.url;
    sourceIcon.alt = feedData.name ? `${feedData.name} source icon` : 'Source icon';
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
    let status = error || `OK`;
    if (feedData.limitNumberTo) {
        status += ` (${feedData.limitNumberTo} shown)`;
    }
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
        const res = await fetch('../feed.json', { cache: 'no-store' });
        if (!res.ok) throw new Error(await res.text());

        // Parse the JSON response
        const { feeds, fetchedAt, timeToFetchInMs } = await res.json();
        status.textContent = '';
        if (fetchedAt && fetchedEl) {
            fetchedEl.textContent = `Updated ${timeAgo(fetchedAt)}, took ${(timeToFetchInMs / 1000).toFixed(2)} seconds`;
        } else if (fetchedEl) {
            fetchedEl.textContent = '';
        }

        // Sort feeds: errors first, then by feed name
        feeds.sort((a, b) => {
            if (a.error && !b.error) return -1;
            if (!a.error && b.error) return 1;
            const nameA = a.feedData?.name || a.feedData?.url || '';
            const nameB = b.feedData?.name || b.feedData?.url || '';
            return nameA.localeCompare(nameB);
        });

        // Create and append list feeds
        feeds.forEach(({ error, feedData }) => {
            const li = createFeedElement(feedData, error);
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
