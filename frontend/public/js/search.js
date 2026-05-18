document.getElementById('searchInput').addEventListener('input', function () {
    let searchQuery = this.value;
    let searchResults = document.getElementById('searchResults');

    searchResults.style.position = 'fixed';
    searchResults.style.top = '80px';
    searchResults.style.left = '50%';
    searchResults.style.transform = 'translateX(-50%)';
    searchResults.style.width = '80%';
    searchResults.style.maxWidth = '800px';
    searchResults.style.backgroundColor = 'white';
    searchResults.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    searchResults.style.zIndex = '1001';
    searchResults.style.borderRadius = '8px';

    if (searchQuery.length > 2) {
        fetch(`/services/post_get_search.php?search=${encodeURIComponent(searchQuery)}`)
            .then(response => response.json())
            .then(data => {
                let posts = Array.isArray(data) ? { posts: data } : data;
                let postArray = posts.posts || [];

                searchResults.innerHTML = '';

                if (postArray.length === 0) {
                    searchResults.innerHTML = '<li class="list-group-item">No results found</li>';
                    return;
                }

                postArray.forEach(item => {
                    let listItem = document.createElement('li');
                    listItem.className = 'list-group-item d-flex align-items-center';
                    listItem.style.cursor = 'pointer';

                    let img = document.createElement('img');
                    img.src = item.thumbnail_path || 'default_thumbnail.jpg';
                    img.alt = item.title;
                    img.className = 'me-2';
                    img.style.width = '50px';
                    img.style.height = '50px';
                    img.style.objectFit = 'cover';

                    let textDiv = document.createElement('div');
                    let content = item.content ? item.content.replace(/<[^>]*>?/gm, '').substring(0, 50) : '';
                    textDiv.innerHTML = `<strong class="text-truncate">${item.title}</strong><br>${content}...`;

                    listItem.appendChild(img);
                    listItem.appendChild(textDiv);

                    listItem.addEventListener('click', () => {
                        window.location.href = `?pages=article&act=post&post=${item.post_id}`;
                    });

                    listItem.addEventListener('mouseover', () => {
                        listItem.style.backgroundColor = '#f8f9fa';
                    });

                    listItem.addEventListener('mouseout', () => {
                        listItem.style.backgroundColor = '';
                    });

                    searchResults.appendChild(listItem);
                });
            })
            .catch(error => console.error("Error:", error));
    } else {
        searchResults.innerHTML = '';
    }
});

document.addEventListener('click', function (event) {
    let searchResults = document.getElementById('searchResults');
    let searchInput = document.getElementById('searchInput');
    if (!searchResults.contains(event.target) && !searchInput.contains(event.target)) {
        searchResults.innerHTML = '';
    }
});