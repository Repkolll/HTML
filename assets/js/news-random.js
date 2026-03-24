document.addEventListener('DOMContentLoaded', function () {
    const list = window.NEWS_LIST || [];
    if (!list || !list.length) return;

    // find the random link element
    const link = document.getElementById('random-next');
    if (!link) return;

    // determine current page file name
    const path = (window.location.pathname || '').split('/').pop();
    // pick candidates excluding current
    // storage key for seen items (per-tab session)
    const STORAGE_KEY = 'newsRandomSeen';
    function readSeen() {
        try {
            const raw = sessionStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }
    function writeSeen(arr) {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
        } catch (e) { /* ignore */ }
    }

    // initialize seen: include current page (user has seen it)
    let seen = readSeen().filter(i => list.includes(i));
    if (list.includes(path) && seen.indexOf(path) === -1) {
        seen.push(path);
        writeSeen(seen);
    }

    function chooseCandidate() {
        // candidates are items not seen yet and not the current page
        let candidates = list.filter(item => item !== path && seen.indexOf(item) === -1);
        if (candidates.length === 0) {
            // all seen — reset seen (keep current marked) and allow repeats
            seen = list.includes(path) ? [path] : [];
            writeSeen(seen);
            candidates = list.filter(item => item !== path);
        }
        if (candidates.length === 0) return null;
        const idx = Math.floor(Math.random() * candidates.length);
        return candidates[idx];
    }

    const initial = chooseCandidate();
    if (!initial) {
        link.style.display = 'none';
        return;
    }
    link.href = initial;

    link.addEventListener('click', function (e) {
        e.preventDefault();
        const next = chooseCandidate();
        if (!next) return;
        // mark chosen as seen immediately to avoid immediate repeats
        const curSeen = readSeen();
        if (curSeen.indexOf(next) === -1) {
            curSeen.push(next);
            writeSeen(curSeen);
        }
        window.location.href = next;
    });
});
