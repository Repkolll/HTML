document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('news-container');
    const loadMoreBtn = document.getElementById('load-more-news');
    const API_NEWS_URL = 'https://localhost:44389/api/newsapi';

    if (!container || !loadMoreBtn) {
        return;
    }

    let alreadyLoaded = false;

    loadMoreBtn.addEventListener('click', async () => {
        if (alreadyLoaded) {
            return;
        }

        loadMoreBtn.disabled = true;
        loadMoreBtn.textContent = 'Загрузка...';

        try {
            const response = await fetch(API_NEWS_URL + '?skip=3&take=3', {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Response not ok');
            }

            const items = await response.json();

            items.forEach(item => {
                const card = document.createElement('div');
                card.className = 'card';

                const link = document.createElement('a');
                link.href = item.linkUrl;

                const img = document.createElement('img');
                img.src = item.imageUrl;
                img.alt = item.title;

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

                link.appendChild(img);
                link.appendChild(content);

                card.appendChild(link);
                container.appendChild(card);
            });

            alreadyLoaded = true;
            loadMoreBtn.textContent = 'Больше новостей нет';
        } catch (error) {
            console.error(error);
            loadMoreBtn.disabled = false;
            loadMoreBtn.textContent = 'Показать ещё новости';
            alert('Не удалось загрузить дополнительные новости. Попробуйте позже.');
        }
    });
});

