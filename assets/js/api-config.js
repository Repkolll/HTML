// Central API base URL resolver for all frontend scripts.
// Priority:
// 1) window.__APP_CONFIG__.API_BASE_URL (can be injected by hosting/runtime)
// 2) window.API_BASE_URL
// 3) localStorage "API_BASE_URL"
// 4) fallback to localhost
(function () {
    function normalize(url) {
        return String(url || '').trim().replace(/\/+$/, '');
    }

    var fromAppConfig = window.__APP_CONFIG__ && window.__APP_CONFIG__.API_BASE_URL
        ? window.__APP_CONFIG__.API_BASE_URL
        : '';
    var fromGlobal = window.API_BASE_URL || '';
    var fromStorage = '';
    try {
        fromStorage = localStorage.getItem('API_BASE_URL') || '';
    } catch (e) {
        fromStorage = '';
    }

    var base = normalize(fromAppConfig) || normalize(fromGlobal) || normalize(fromStorage) || 'https://localhost:44389';
    window.getApiBaseUrl = function () {
        return base;
    };
})();

