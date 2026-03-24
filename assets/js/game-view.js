document.addEventListener('DOMContentLoaded', function () {
    const API_ROOT = (window.getApiBaseUrl ? window.getApiBaseUrl() : 'https://localhost:44389');
    const API_BASE = API_ROOT + '/api/gamesapi/';
    console.info('[game-view] API URL:', API_BASE);

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const numericId = parseInt(id || '', 10);

    const titleEl = document.getElementById('game-title');
    const crumbTitleEl = document.getElementById('crumb-title');
    const coverEl = document.getElementById('game-cover');
    const ratingEl = document.getElementById('game-rating');
    const platformEl = document.getElementById('game-platform');
    const descEl = document.getElementById('game-description');
    const genreEl = document.getElementById('game-genre');
    const priceEl = document.getElementById('game-price');
    const reqEl = document.getElementById('game-requirements');

    function showError(message) {
        if (titleEl) titleEl.textContent = 'Игра не найдена';
        if (crumbTitleEl) crumbTitleEl.textContent = 'Ошибка';
        if (descEl) descEl.textContent = message;
        if (reqEl) reqEl.textContent = '-';
    }

    if (!numericId) {
        showError('Неверный идентификатор игры в URL.');
        return;
    }

    const url = API_BASE + numericId;
    fetch(url, {
        headers: { 'Accept': 'application/json' }
    })
        .then(function (res) {
            console.info('[game-view] GET request:', url, 'status:', res.status);
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        })
        .then(function (game) {
            if (titleEl) titleEl.textContent = game.title || 'Без названия';
            if (crumbTitleEl) crumbTitleEl.textContent = game.title || 'Игра';
            if (ratingEl) ratingEl.textContent = (typeof game.rating === 'number') ? game.rating.toFixed(1) : '-';
            if (platformEl) platformEl.textContent = game.platform || '-';
            if (descEl) descEl.textContent = game.description || 'Описание отсутствует.';
            if (genreEl) genreEl.textContent = game.genre || '-';
            if (priceEl) priceEl.textContent = game.price > 0 ? (game.price + ' рублей') : 'Бесплатно';
            if (reqEl) reqEl.textContent = game.requirements || 'Не указаны.';
            if (coverEl && game.imageUrl) {
                coverEl.src = game.imageUrl;
                coverEl.alt = game.title || 'Обложка игры';
            }

            document.title = (game.title || 'Игра') + ' — Страница игры';
        })
        .catch(function (err) {
            console.error('[game-view] GET failed:', url, err);
            showError('Не удалось загрузить данные игры с сервера.');
        });
});

