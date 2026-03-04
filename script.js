var clients = [];

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('search').addEventListener('input', filter);
    document.getElementById('filter').addEventListener('change', filter);
    loadClients();
});

function loadClients() {
    var loading = document.getElementById('loading');
    var list = document.getElementById('client-list');
    var empty = document.getElementById('empty');

    loading.classList.remove('hidden');
    list.innerHTML = '';
    empty.classList.add('hidden');

    fetch('https://65410dfe45bedb25bfc3281a.mockapi.io/WxCC/customer', { cache: 'no-store' })
        .then(function (r) { return r.json(); })
        .then(function (data) {
            clients = Array.isArray(data) ? data : [];
            clients.sort(function (a, b) { return (a.id || 0) - (b.id || 0); });
            loading.classList.add('hidden');
            filter();
        })
        .catch(function (err) {
            loading.classList.add('hidden');
            list.innerHTML = '<p class="error">Failed to load clients.</p>';
            console.error(err);
        });
}

function filter() {
    var q = (document.getElementById('search').value || '').toLowerCase().trim();
    var key = document.getElementById('filter').value;
    var list = document.getElementById('client-list');
    var empty = document.getElementById('empty');

    var filtered = clients.filter(function (c) {
        if (!q) return true;
        if (key === 'all') {
            return Object.values(c).some(function (v) {
                return String(v || '').toLowerCase().indexOf(q) !== -1;
            });
        }
        return String(c[key] || '').toLowerCase().indexOf(q) !== -1;
    });

    list.innerHTML = '';
    if (filtered.length === 0) {
        empty.classList.remove('hidden');
        return;
    }
    empty.classList.add('hidden');

    filtered.forEach(function (c) {
        var name = [c.salutation, c.firstName, c.lastName].filter(Boolean).join(' ').trim() || 'Unknown';
        var card = document.createElement('div');
        card.className = 'card';
        card.innerHTML =
            '<div class="card-header">' +
            '<i class="icon icon-contact-card_24"></i>' +
            '<strong>' + escapeHtml(name) + '</strong>' +
            '</div>' +
            '<div class="card-body">' +
            row('Username', c.userName, true, false) +
            row('Phone', c.phoneNumber, true, true) +
            row('Purchase Order', c.purchaseOrder, true, false) +
            row('Purchase Number', c.purchaseNumber, true, false) +
            row('Order Ref', c.orderRef, true, false) +
            row('Car Reg', c.carReg, true, false) +
            row('Journey State', c.journeyState, false, false) +
            '</div>';
        list.appendChild(card);
    });
}

function row(label, value, hasCopy, hasCall) {
    var v = value != null ? escapeHtml(String(value)) : '—';
    var copyBtn = hasCopy && value ? '<button class="btn" onclick="copy(\'' + escapeAttr(value) + '\')"><i class="icon icon-copy_14"></i> Copy</button>' : '';
    var callBtn = hasCall && value ? '<a class="btn btn--primary" href="tel:' + escapeAttr(value) + '"><i class="icon icon-deskphone_16"></i> Call</a>' : '';
    return '<p><span class="label">' + escapeHtml(label) + '</span><span class="value">' + v + '</span>' + copyBtn + callBtn + '</p>';
}

function escapeHtml(s) {
    if (s == null) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

function escapeAttr(s) {
    if (s == null) return '';
    return String(s).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function copy(text) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(function () {
        alert('Copied');
    }).catch(function () {
        alert('Copy failed');
    });
}
