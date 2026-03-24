document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('announces-container');
    const platformSelect = document.getElementById('announce-platform');
    const genreSelect = document.getElementById('announce-genre');
    const API_BASE = (window.getApiBaseUrl ? window.getApiBaseUrl() : 'https://localhost:44389');
    const API_ANNOUNCES_URL = API_BASE + '/api/announcesapi';

    if (!container || !platformSelect || !genreSelect) {
        return;
    }

    function renderAnnounces(list) {
        container.innerHTML = '';

        list.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';

            const link = document.createElement('a');
            link.href = item.linkUrl;

            const content = document.createElement('div');
            content.className = 'card-content';

            const time = document.createElement('p');
            time.textContent = item.timeText;

            const title = document.createElement('h3');
            title.textContent = item.title;

            const excerpt = document.createElement('p');
            excerpt.textContent = item.summary;

            content.appendChild(time);
            content.appendChild(title);
            content.appendChild(excerpt);

            link.appendChild(content);
            card.appendChild(link);
            container.appendChild(card);
        });
    }

    async function applyFilters() {
        const platform = platformSelect.value;
        const genre = genreSelect.value;

        const params = new URLSearchParams();
        if (platform) params.set('platform', platform);
        if (genre) params.set('genre', genre);

        const url = params.toString() ? (API_ANNOUNCES_URL + '?' + params.toString()) : API_ANNOUNCES_URL;

        try {
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Response not ok');
            }

            const items = await response.json();
            renderAnnounces(items || []);
        } catch (error) {
            console.error(error);
            alert('Не удалось загрузить анонсы из БД. Проверьте, что сервер запущен.');
        }
    }

    platformSelect.addEventListener('change', applyFilters);
    genreSelect.addEventListener('change', applyFilters);

    // Начальная загрузка данных
    applyFilters();
});

