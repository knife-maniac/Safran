function createItemElement(feed) {
    const li = document.createElement('li');
    li.className = 'feed';

    const status = feed.error || `fetched ${feed.numberOfItemsFetched} items (limitied to ${feed.limitNumberTo})`;
    li.textContent = `feed "${feed.name}" (${feed.url}) : ${status}`

    return li;
}


async function load() {
    const status = document.getElementById('status');
    const list = document.getElementById('feeds');
    const fetchedEl = document.getElementById('fetched');

    try {
        // Fetch the feed items from the backend API
        // TODO: Use URL configured in .env file
        const res = await fetch('/projects/safran/feed.json', { cache: 'no-store' });
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
            console.log(feed);
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
