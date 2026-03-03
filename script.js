document.addEventListener('DOMContentLoaded', function () {
    fetchClientData();
    initializeSortable();
    var searchInput = document.getElementById('search-input');
    var filterSelect = document.getElementById('filter-select');
    searchInput.addEventListener('input', runSearch);
    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            searchInput.value = '';
            runSearch();
            searchInput.blur();
        }
    });
    filterSelect.addEventListener('change', runSearch);
    document.getElementById('client-list').addEventListener('click', handleCardClick);
});

var clientsData = [];

var fieldLabels = {
    userName: 'Username',
    phoneNumber: 'Phone',
    purchaseOrder: 'Purchase order',
    purchaseNumber: 'Purchase number',
    orderRef: 'Order reference',
    carReg: 'Car registration',
    journeyState: 'Journey state'
};

var displayFields = ['userName', 'phoneNumber', 'purchaseOrder', 'purchaseNumber', 'orderRef', 'carReg', 'journeyState'];

function fetchClientData() {
    var listEl = document.getElementById('client-list');
    var loadingEl = document.getElementById('loading');
    var emptyEl = document.getElementById('empty');
    listEl.innerHTML = '';
    listEl.hidden = true;
    emptyEl.hidden = true;
    loadingEl.hidden = false;

    fetch('https://65410dfe45bedb25bfc3281a.mockapi.io/WxCC/customer')
        .then(function (res) { return res.json(); })
        .then(function (data) {
            data.sort(function (a, b) { return Number(a.id) - Number(b.id); });
            clientsData = data;
            runSearch();
        })
        .catch(function (err) {
            console.error('Error fetching client data:', err);
            loadingEl.hidden = true;
            listEl.hidden = false;
            listEl.innerHTML = '<p class="state state--empty">Failed to load clients. Please try again.</p>';
        });
}

function runSearch() {
    var searchInput = document.getElementById('search-input');
    var filterSelect = document.getElementById('filter-select');
    var query = (searchInput.value || '').trim().toLowerCase();
    var filterKey = filterSelect.value;
    var listEl = document.getElementById('client-list');
    var loadingEl = document.getElementById('loading');
    var emptyEl = document.getElementById('empty');

    loadingEl.hidden = true;

    var filtered = clientsData.filter(function (client) {
        if (!query) return true;
        if (filterKey === 'all') {
            return Object.values(client).some(function (v) {
                return String(v || '').toLowerCase().includes(query);
            });
        }
        var val = client[filterKey];
        return String(val || '').toLowerCase().includes(query);
    });

    displayClients(filtered, listEl);
    listEl.hidden = false;
    emptyEl.hidden = filtered.length > 0;
}

function displayClients(data, containerEl) {
    containerEl = containerEl || document.getElementById('client-list');
    containerEl.innerHTML = '';
    var list = containerEl;

    data.forEach(function (client) {
        var name = [client.salutation, client.firstName, client.lastName].filter(Boolean).join(' ').trim() || 'Unknown';
        var initial = (client.firstName || name).charAt(0).toUpperCase();

        var card = document.createElement('div');
        card.className = 'client-card';
        card.setAttribute('role', 'listitem');

        var fieldsHtml = displayFields.map(function (key) {
            var value = client[key];
            var label = fieldLabels[key] || key;
            var valueStr = value != null ? escapeHtml(String(value)) : '—';
            var isPhone = key === 'phoneNumber';
            var actions = value != null && value !== ''
                ? '<span class="client-card__actions">' +
                    '<button type="button" class="btn btn--ghost btn--icon" data-copy="' + escapeAttr(value) + '" title="Copy">Copy</button>' +
                    (isPhone ? '<a href="tel:' + escapeAttr(value) + '" class="btn btn--primary btn--icon" title="Call">Call</a>' : '') +
                    '</span>'
                : '';
            return '<div class="client-card__row">' +
                '<span class="client-card__label">' + escapeHtml(label) + '</span>' +
                '<span class="client-card__value-wrap">' +
                '<span class="client-card__value">' + valueStr + '</span>' + actions +
                '</span></div>';
        }).join('');

        card.innerHTML =
            '<div class="client-card__header">' +
            '<span class="client-card__avatar" aria-hidden="true">' + escapeHtml(initial) + '</span>' +
            '<h2 class="client-card__name">' + escapeHtml(name) + '</h2>' +
            '</div>' +
            '<div class="client-card__fields">' + fieldsHtml + '</div>';

        list.appendChild(card);
    });
}

function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function escapeAttr(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function handleCardClick(e) {
    var btn = e.target.closest('[data-copy]');
    if (btn) {
        e.preventDefault();
        var text = btn.getAttribute('data-copy');
        if (text != null) copyToClipboard(text);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function () {
        showToast('Copied');
    }).catch(function (err) {
        console.error('Copy failed:', err);
        showToast('Copy failed');
    });
}

function showToast(message) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    toast.setAttribute('data-visible', '');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
        toast.removeAttribute('data-visible');
        toast.hidden = true;
    }, 2000);
}

function initializeSortable() {
    var list = document.getElementById('client-list');
    if (!list || typeof Sortable === 'undefined') return;
    new Sortable(list, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        onEnd: function () { /* optional: persist order */ }
    });
}
