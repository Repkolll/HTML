document.addEventListener('DOMContentLoaded', function () {
    var STORAGE_KEY = 'siteBookmarks';
    function loadBookmarks() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
        catch (e) { return []; }
    }
    function saveBookmarks(list) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (e) {}
    }
    function isBookmarked(href) {
        return loadBookmarks().some(function (it) { return it.href === href; });
    }
    function toggleBookmark(meta) {
        var list = loadBookmarks();
        var idx = list.findIndex(function (it) { return it.href === meta.href; });
        if (idx >= 0) { list.splice(idx,1); }
        else { list.push(meta); }
        saveBookmarks(list);
        updateButtons(meta.href);
    }
    function updateButtons(href) {
        var buttons = document.querySelectorAll('.bookmark-btn[data-href]');
        Array.prototype.forEach.call(buttons, function (btn) {
            var h = btn.getAttribute('data-href');
            var pressed = isBookmarked(h);
            btn.setAttribute('aria-pressed', pressed ? 'true' : 'false');
            btn.classList.toggle('active', pressed);
        });
    }

    document.body.addEventListener('click', function (e) {
        var target = e.target;
        if (target && target.closest) target = target.closest('.bookmark-btn');
        if (!target || !target.classList.contains('bookmark-btn')) return;
        e.preventDefault();
        var href = target.getAttribute('data-href') || (window.location.pathname || '').split('/').pop();
        var card = target.closest('.card') || target.closest('article');
        var title = document.title || href;
        var img = '';
        if (card) {
            var h = card.querySelector('h1, h2');
            if (h) title = h.textContent.trim();
            var im = card.querySelector('img');
            if (im) img = im.getAttribute('src') || '';
        }
        toggleBookmark({ href: href, title: title, img: img });
    });

    // set initial state on page load
    updateButtons();

    // expose renderer for bookmarks listing pages
    window.renderBookmarksList = function (container) {
        if (!container) return;
        var list = loadBookmarks();
        if (!list || !list.length) { container.innerHTML = '<p>Закладок пока нет.</p>'; return; }
        var html = '<div class="bookmarks-grid">';
        list.forEach(function (item) {
            html += '<div class="bookmark-item">';
            html += '<a class="bookmark-link" href="' + item.href + '">';
            if (item.img) html += '<img src="' + item.img + '" alt="">';
            html += '<div class="bookmark-title">' + (item.title || item.href) + '</div>';
            html += '</a>';
            html += '<button class="bookmark-remove" data-href="' + item.href + '">Удалить</button>';
            html += '</div>';
        });
        html += '</div>';
        container.innerHTML = html;

        // attach remove handlers
        var removes = container.querySelectorAll('.bookmark-remove');
        Array.prototype.forEach.call(removes, function (btn) {
            btn.addEventListener('click', function () {
                var h = btn.getAttribute('data-href');
                var arr = loadBookmarks().filter(function (it) { return it.href !== h; });
                saveBookmarks(arr);
                window.renderBookmarksList(container);
                updateButtons(h);
            });
        });
    };
});
