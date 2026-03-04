var clientsData = [];

var fieldLabels = { userName: 'Username', phoneNumber: 'Phone', purchaseOrder: 'Purchase order', purchaseNumber: 'Purchase number', orderRef: 'Order reference', carReg: 'Car registration', journeyState: 'Journey state' };
var displayFields = ['userName', 'phoneNumber', 'purchaseOrder', 'purchaseNumber', 'orderRef', 'carReg', 'journeyState'];

document.addEventListener('DOMContentLoaded', function () {
    var listEl = document.getElementById('client-list');
    var searchInput = document.getElementById('search-input');
    var filterSelect = document.getElementById('filter-select');

    if (searchInput) searchInput.addEventListener('input', runSearch);
    if (filterSelect) filterSelect.addEventListener('change', runSearch);
    if (listEl) listEl.addEventListener('click', handleCardClick);

    fetch('https://65410dfe45bedb25bfc3281a.mockapi.io/WxCC/customer', { cache: 'no-store' })
        .then(function (res) { return res.json(); })
        .then(function (data) {
            clientsData = Array.isArray(data) ? data : [];
            clientsData.sort(function (a, b) { return Number(a.id) - Number(b.id); });
            displayClients(clientsData);
            hideLoading();
            showList();
            if (document.getElementById('empty')) document.getElementById('empty').hidden = clientsData.length > 0;
            initializeSortable();
        })
        .catch(function (err) {
            console.error('Error fetching clients:', err);
            hideLoading();
            showList();
            if (listEl) listEl.innerHTML = '<p class="state state--empty">Failed to load clients.</p>';
        });
});

function hideLoading() {
    var el = document.getElementById('loading');
    if (el) el.hidden = true;
}

function showList() {
    var el = document.getElementById('client-list');
    if (el) el.hidden = false;
}

function runSearch() {
    var query = (document.getElementById('search-input') && document.getElementById('search-input').value || '').trim().toLowerCase();
    var filterKey = (document.getElementById('filter-select') && document.getElementById('filter-select').value) || 'all';
    var listEl = document.getElementById('client-list');
    var emptyEl = document.getElementById('empty');
    if (!listEl) return;

    var filtered = (clientsData || []).filter(function (c) {
        if (!query) return true;
        if (filterKey === 'all') return Object.values(c).some(function (v) { return String(v || '').toLowerCase().includes(query); });
        return String(c[filterKey] || '').toLowerCase().includes(query);
    });

    displayClients(filtered);
    listEl.hidden = false;
    if (emptyEl) emptyEl.hidden = filtered.length > 0;
}

function displayClients(data) {
    var containerEl = document.getElementById('client-list');
    if (!containerEl) return;
    containerEl.innerHTML = '';
    var items = Array.isArray(data) ? data : [];

    items.forEach(function (client) {
        if (!client || typeof client !== 'object') return;
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
                ? '<span class="client-card__actions"><button type="button" class="btn btn--ghost btn--icon" data-copy="' + escapeAttr(value) + '" title="Copy">Copy</button>' +
                    (isPhone ? '<a href="tel:' + escapeAttr(value) + '" class="btn btn--primary btn--icon" title="Call">Call</a>' : '') + '</span>'
                : '';
            return '<div class="client-card__row"><span class="client-card__label">' + escapeHtml(label) + '</span><span class="client-card__value-wrap"><span class="client-card__value">' + valueStr + '</span>' + actions + '</span></div>';
        }).join('');

        card.innerHTML = '<div class="client-card__header"><span class="client-card__avatar" aria-hidden="true">' + escapeHtml(initial) + '</span><h2 class="client-card__name">' + escapeHtml(name) + '</h2></div><div class="client-card__fields">' + fieldsHtml + '</div>';
        containerEl.appendChild(card);
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
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function handleCardClick(e) {
    var btn = e.target.closest('[data-copy]');
    if (btn) { e.preventDefault(); copyToClipboard(btn.getAttribute('data-copy') || ''); }
}

function copyToClipboard(text) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(function () { showToast('Copied'); }).catch(function () { showToast('Copy failed'); });
}

function showToast(msg) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    t.setAttribute('data-visible', '');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () { t.removeAttribute('data-visible'); t.hidden = true; }, 2000);
}

function initializeSortable() {
    var list = document.getElementById('client-list');
    if (list && typeof Sortable !== 'undefined') new Sortable(list, { animation: 150, ghostClass: 'sortable-ghost' });
}
