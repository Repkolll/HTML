document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('addGameForm');
    const submitBtn = document.getElementById('submitGameBtn');
    const statusEl = document.getElementById('submitStatus');
    if (!form) return;
    const API_BASE = (window.getApiBaseUrl ? window.getApiBaseUrl() : 'https://localhost:44389');
    const API_CREATE_GAME_URL = API_BASE + '/api/gamesapi';
    function setError(id, message) {
        const el = document.getElementById('error-' + id);
        if (el) el.textContent = message || '';
    }
    function clearErrors() {
        ['title', 'genre', 'platform', 'price', 'rating', 'image', 'description', 'requirements']
            .forEach(id => setError(id, ''));
    }
    function isValidText(s, minLen) {
        const v = (s || '').trim();
        return v.length >= minLen;
    }
    function parseNum(val) {
        if (val === null || val === undefined) return NaN;
        const s = String(val).replace(',', '.').trim();
        return parseFloat(s);
    }
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        clearErrors();
        let valid = true;
        const title = form.title.value;
        const genre = form.genre.value;
        const platform = form.platform.value;
        const price = parseNum(form.price.value);
        const rating = parseNum(form.rating.value);
        const description = form.description.value;
        const requirements = form.requirements.value;
        if (!isValidText(title, 2)) {
            setError('title', 'Введите название (минимум 2 символа).');
            valid = false;
        }
        if (!genre) {
            setError('genre', 'Выберите жанр.');
            valid = false;
        }
        if (!isValidText(platform, 2)) {
            setError('platform', 'Введите платформу(ы), например: PC, PS5.');
            valid = false;
        }
        if (Number.isNaN(price) || price < 0 || price > 1000000) {
            setError('price', 'Цена должна быть числом ≥ 0.');
            valid = false;
        }
        if (Number.isNaN(rating) || rating < 0 || rating > 5) {
            setError('rating', 'Рейтинг должен быть числом от 0 до 5.');
            valid = false;
        }
        if (!isValidText(description, 10)) {
            setError('description', 'Описание должно содержать минимум 10 символов.');
            valid = false;
        }
        if (!isValidText(requirements, 10)) {
            setError('requirements', 'Требования должны содержать минимум 10 символов.');
            valid = false;
        }
        const fileInput = form.image;
        const file = fileInput && fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
        if (!file) {
            setError('image', 'Выберите изображение (png/jpg).');
            valid = false;
        } else {
            const allowed = ['image/jpeg', 'image/png'];
            if (!allowed.includes(file.type)) {
                setError('image', 'Недопустимый формат. Разрешены PNG/JPG.');
                valid = false;
            } else if (file.size > 2 * 1024 * 1024) {
                setError('image', 'Файл слишком большой (макс. 2 МБ).');
                valid = false;
            }
        }
        if (!valid) return;
        const fd = new FormData();
        fd.append('title', title.trim());
        fd.append('genre', genre);
        fd.append('platform', platform.trim());
        fd.append('price', String(Math.floor(price)));
        fd.append('rating', String(Math.round(rating * 10) / 10).replace('.', ','));
        fd.append('description', description.trim());
        fd.append('requirements', requirements.trim());
        fd.append('image', file);
        submitBtn.disabled = true;
        statusEl.textContent = 'Отправка...';
        try {
            const res = await fetch(API_CREATE_GAME_URL, {
                method: 'POST',
                body: fd
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error('HTTP ' + res.status + ' ' + text);
            }
            const created = await res.json();
            statusEl.textContent = 'Готово. Переходим в каталог...';
            // перейти в каталог; новая игра будет видна (каталог читает из БД)
            setTimeout(() => {
                const id = created && created.id ? created.id : '';
                window.location.href = 'games.html' + (id ? ('#game-' + id) : '');
            }, 400);
        } catch (err) {
            console.error(err);
            statusEl.textContent = '';
            alert('Не удалось добавить игру. Проверьте, что сервер запущен и поддерживает POST /api/gamesapi.');
            submitBtn.disabled = false;
        }
    });
});
