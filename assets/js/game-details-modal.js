document.addEventListener('DOMContentLoaded', function () {
    const catalog = document.querySelector('.games-catalog');
    if (!catalog) return;

    const API_GAME_DETAILS_URL = 'https://localhost:44389/api/gamesapi/';
    const detailsCache = new Map();
    let modal = null;
    let modalContent = null;
    let modalTitle = null;
    let modalBody = null;

    function createModal() {
        modal = document.createElement('div');
        modal.id = 'game-details-modal';
        modal.style.position = 'fixed';
        modal.style.inset = '0';
        modal.style.background = 'rgba(0,0,0,0.75)';
        modal.style.display = 'none';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '1000';

        modalContent = document.createElement('div');
        modalContent.style.background = '#111';
        modalContent.style.color = '#fff';
        modalContent.style.maxWidth = '720px';
        modalContent.style.width = '90%';
        modalContent.style.padding = '24px';
        modalContent.style.borderRadius = '10px';
        modalContent.style.boxShadow = '0 20px 40px rgba(0,0,0,0.5)';
        modalContent.style.position = 'relative';

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.textContent = '×';
        closeBtn.setAttribute('aria-label', 'Закрыть');
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '8px';
        closeBtn.style.right = '12px';
        closeBtn.style.fontSize = '24px';
        closeBtn.style.background = 'transparent';
        closeBtn.style.border = 'none';
        closeBtn.style.color = '#fff';
        closeBtn.style.cursor = 'pointer';

        closeBtn.addEventListener('click', hideModal);

        modalTitle = document.createElement('h2');
        modalTitle.style.marginTop = '0';
        modalTitle.style.marginBottom = '8px';

        modalBody = document.createElement('div');

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(modalTitle);
        modalContent.appendChild(modalBody);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                hideModal();
            }
        });

        window.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                hideModal();
            }
        });
    }

    function hideModal() {
        if (modal) {
            modal.style.display = 'none';
        }
    }

    function showModalForGame(game) {
        if (!modal) {
            createModal();
        }

        modalTitle.textContent = game.title;

        const parts = [];
        if (game.subtitle) {
            parts.push('<p style="margin-bottom: 12px; color:#ccc;">' + game.subtitle + '</p>');
        }
        parts.push('<p><strong>Жанр:</strong> ' + game.genre + '</p>');
        parts.push('<p><strong>Платформы:</strong> ' + game.platforms + '</p>');
        parts.push('<p><strong>Рейтинг:</strong> ' + game.rating + '</p>');
        parts.push('<p><strong>Цена:</strong> ' + (game.price > 0 ? game.price + ' рублей' : 'Бесплатно') + '</p>');
        if (game.description) {
            parts.push('<p style="margin-top: 12px;">' + game.description + '</p>');
        }
        if (game.requirements) {
            parts.push('<p style="margin-top: 12px;"><strong>Системные требования:</strong><br>' + game.requirements + '</p>');
        }
        if (game.screenshots && game.screenshots.length) {
            parts.push('<div style="margin-top: 16px; display:flex; gap:12px; flex-wrap:wrap;">');
            game.screenshots.forEach(function (src) {
                parts.push('<img src="' + src + '" alt="" style="max-width:180px; border-radius:6px; object-fit:cover;">');
            });
            parts.push('</div>');
        }

        modalBody.innerHTML = parts.join('');
        modal.style.display = 'flex';
    }

    function loadDetailsAndShow(id) {
        const numericId = parseInt(id, 10);
        if (!numericId) return;

        const cached = detailsCache.get(numericId);
        if (cached) {
            showModalForGame(cached);
            return;
        }

        fetch(API_GAME_DETAILS_URL + numericId, {
            headers: { 'Accept': 'application/json' }
        })
            .then(function (response) {
                if (!response.ok) throw new Error('Failed to load game details');
                return response.json();
            })
            .then(function (g) {
                const normalized = {
                    title: g.title,
                    subtitle: '',
                    genre: g.genre,
                    platforms: g.platform,
                    rating: g.rating,
                    price: g.price,
                    description: g.description,
                    requirements: g.requirements,
                    screenshots: g.imageUrl ? [g.imageUrl] : []
                };

                detailsCache.set(numericId, normalized);
                showModalForGame(normalized);
            })
            .catch(function (err) {
                console.error(err);
                alert('Не удалось загрузить подробную информацию об игре. Попробуйте позже.');
            });
    }

    catalog.addEventListener('click', function (e) {
        const btn = e.target.closest('.details-btn');
        if (!btn) return;
        e.preventDefault();
        const id = btn.getAttribute('data-game-id') ||
            (btn.closest('.card') && btn.closest('.card').getAttribute('data-game-id'));
        if (id) {
            loadDetailsAndShow(id);
        }
    });
});

