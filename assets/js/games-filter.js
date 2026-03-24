// AJAX-поиск и фильтрация игр в каталоге
document.addEventListener('DOMContentLoaded', function () {
    const catalog = document.querySelector('.games-catalog');
    const searchInput = document.getElementById('search-query');
    const genreSelect = document.getElementById('genre');
    const priceMinInput = document.getElementById('price-min');
    const priceMaxInput = document.getElementById('price-max');
    const ratingMinInput = document.getElementById('rating-min');
    const ratingMaxInput = document.getElementById('rating-max');

    if (!catalog) return;

    const PRICE_MIN = 0;
    const PRICE_MAX = 5000;
    const RATING_MIN = 0;
    const RATING_MAX = 5;

    let searchTimeout = null;
    let activeAbortController = null;

    function parseNumber(raw, opts) {
        if (!raw) return null;
        const s = String(raw).trim();
        if (s === '') return null;
        const norm = s.replace(',', '.');
        const val = parseFloat(norm);
        if (isNaN(val)) return null;
        let v = val;
        if (opts && opts.type === 'price') v = Math.floor(v);
        if (opts && typeof opts.min === 'number') v = Math.max(opts.min, v);
        if (opts && typeof opts.max === 'number') v = Math.min(opts.max, v);
        return v;
    }

    function buildQueryParams() {
        const params = new URLSearchParams();

        const search = (searchInput && searchInput.value ? searchInput.value : '').trim();
        const genre = genreSelect ? genreSelect.value : '';

        const priceMin = parseNumber(priceMinInput && priceMinInput.value, { type: 'price', min: PRICE_MIN, max: PRICE_MAX });
        const priceMax = parseNumber(priceMaxInput && priceMaxInput.value, { type: 'price', min: PRICE_MIN, max: PRICE_MAX });
        const ratingMin = parseNumber(ratingMinInput && ratingMinInput.value, { type: 'rating', min: RATING_MIN, max: RATING_MAX });
        const ratingMax = parseNumber(ratingMaxInput && ratingMaxInput.value, { type: 'rating', min: RATING_MIN, max: RATING_MAX });

        if (search) params.set('search', search);
        if (genre) params.set('genre', genre);
        if (priceMin !== null) params.set('priceMin', String(priceMin));
        if (priceMax !== null) params.set('priceMax', String(priceMax));
        if (ratingMin !== null) params.set('ratingMin', String(ratingMin));
        if (ratingMax !== null) params.set('ratingMax', String(ratingMax));

        return params;
    }

    async function deleteGame(id, title) {
        const ok = confirm(`Удалить игру "${title}" (ID: ${id})?`);
        if (!ok) return;

        try {
            const res = await fetch(API_URL + '/' + encodeURIComponent(String(id)), {
                method: 'DELETE'
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error('HTTP ' + res.status + ' ' + text);
            }

            // перезагрузить каталог (он читает из БД)
            applyFilters();
        } catch (err) {
            console.error(err);
            alert('Не удалось удалить игру. Проверь, что на сервере есть DELETE /api/gamesapi/{id}.');
        }
    }

    function renderGames(list) {
        catalog.innerHTML = '';
        list.forEach(function (game) {
            const card = document.createElement('div');
            card.className = 'card';
            card.setAttribute('data-game-id', String(game.id));
    
            const link = document.createElement('a');
            link.href = 'game-view.html?id=' + encodeURIComponent(String(game.id));
    
            const img = document.createElement('img');
            img.src = game.imageUrl || 'assets/img/placeholder.png';
            img.alt = game.title;
            img.width = 200;
            img.height = 260;
            img.style.objectFit = 'cover';
            img.style.display = 'block';
    
            link.appendChild(img);
    
            const bookmarkBtn = document.createElement('button');
            bookmarkBtn.className = 'bookmark-btn';
            bookmarkBtn.setAttribute('data-href', link.href);
            bookmarkBtn.setAttribute('aria-pressed', 'false');
            bookmarkBtn.setAttribute('aria-label', 'Добавить в закладки');
            bookmarkBtn.textContent = '❤';
    
            const info = document.createElement('div');
            info.style.display = 'flex';
            info.style.justifyContent = 'space-between';
            info.style.gap = '8px';
    
            const ratingSpan = document.createElement('span');
            ratingSpan.textContent = game.rating.toFixed(1);
    
            const priceSpan = document.createElement('span');
            priceSpan.textContent = game.price > 0 ? game.price + ' рублей' : 'Бесплатно';
    
            info.appendChild(ratingSpan);
            info.appendChild(priceSpan);
    
            const detailsBtn = document.createElement('button');
            detailsBtn.type = 'button';
            detailsBtn.className = 'details-btn';
            detailsBtn.textContent = 'Подробнее';
            detailsBtn.setAttribute('data-game-id', String(game.id));

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Удалить';
            deleteBtn.style.marginTop = '8px';
            deleteBtn.style.background = '#b00020';
            deleteBtn.style.color = '#fff';
            deleteBtn.style.border = 'none';
            deleteBtn.style.borderRadius = '6px';
            deleteBtn.style.padding = '10px 12px';
            deleteBtn.style.cursor = 'pointer';
            deleteBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                deleteGame(game.id, game.title);
            });
    
            card.appendChild(link);
            card.appendChild(bookmarkBtn);
            card.appendChild(info);
            card.appendChild(detailsBtn);
            card.appendChild(deleteBtn);
    
            catalog.appendChild(card);
        });

        if (window.updateButtonsForGamesCatalog && typeof window.updateButtonsForGamesCatalog === 'function') {
            window.updateButtonsForGamesCatalog();
        } else if (window.dispatchEvent) {
            // триггерим пользовательское событие, если нужно
            const evt = new Event('gamesCatalogRendered');
            window.dispatchEvent(evt);
        }
    }

    function applyFilters() {
        const params = buildQueryParams();
        const url = params.toString() ? (API_URL + '?' + params.toString()) : API_URL;

        if (activeAbortController) {
            activeAbortController.abort();
        }
        activeAbortController = new AbortController();

        fetch(url, {
            headers: { 'Accept': 'application/json' },
            signal: activeAbortController.signal
        })
            .then(res => {
                if (!res.ok) throw new Error('Bad response: ' + res.status);
                return res.json();
            })
            .then(data => {
                renderGames(data || []);
            })
            .catch(err => {
                if (err && err.name === 'AbortError') return;
                console.error('fetch error', err);
            });
    }

    function setupEvents() {
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                if (searchTimeout) clearTimeout(searchTimeout);
                searchTimeout = setTimeout(applyFilters, 300);
            });
        }
        if (genreSelect) {
            genreSelect.addEventListener('change', applyFilters);
        }
        if (priceMinInput) {
            priceMinInput.addEventListener('input', applyFilters);
        }
        if (priceMaxInput) {
            priceMaxInput.addEventListener('input', applyFilters);
        }
        if (ratingMinInput) {
            ratingMinInput.addEventListener('input', applyFilters);
        }
        if (ratingMaxInput) {
            ratingMaxInput.addEventListener('input', applyFilters);
        }
    }

    const API_URL = 'https://localhost:44389/api/gamesapi';

    setupEvents();
    applyFilters();
});

//https://localhost:44389/api/gamesapi
//http://localhost:8000/games.html
