document.addEventListener('DOMContentLoaded', function() {
    console.log('Page has loaded');
    fetchClientData();
    initializeSortable();
    document.getElementById('search-button').addEventListener('click', searchClients);
});

let clientsData = [];

function fetchClientData() {
    fetch('https://65410dfe45bedb25bfc3281a.mockapi.io/WxCC/customer')
        .then(response => response.json())
        .then(data => {
            // Sort data by id
            data.sort((a, b) => a.id - b.id);
            clientsData = data;
            displayClients(data);
        })
        .catch(error => console.error('Error fetching client data:', error));
}

function displayClients(data) {
    const clientList = document.getElementById('client-list');
    clientList.innerHTML = ''; // Clear any existing content
    data.forEach(client => {
        const clientBox = document.createElement('div');
        clientBox.className = 'client-box';
        clientBox.innerHTML = `
            <i class="fas fa-user icon"></i>
            <div>
                <h2>${client.salutation} ${client.firstName} ${client.lastName}</h2>
                <p><strong>Username:</strong> ${client.userName} <button class="copy-button" onclick="copyToClipboard('${client.userName}')">Copy</button></p>
                <p><strong>Phone:</strong> ${client.phoneNumber} <button class="copy-button" onclick="copyToClipboard('${client.phoneNumber}')">Copy</button> <button class="call-button" onclick="callNumber('${client.phoneNumber}')">Call</button></p>
                <p><strong>Purchase Order:</strong> ${client.purchaseOrder} <button class="copy-button" onclick="copyToClipboard('${client.purchaseOrder}')">Copy</button></p>
                <p><strong>Purchase Number:</strong> ${client.purchaseNumber} <button class="copy-button" onclick="copyToClipboard('${client.purchaseNumber}')">Copy</button></p>
                <p><strong>Order Reference:</strong> ${client.orderRef} <button class="copy-button" onclick="copyToClipboard('${client.orderRef}')">Copy</button></p>
                <p><strong>Car Registration:</strong> ${client.carReg} <button class="copy-button" onclick="copyToClipboard('${client.carReg}')">Copy</button></p>
                <p><strong>Journey State:</strong> ${client.journeyState} <button class="copy-button" onclick="copyToClipboard('${client.journeyState}')">Copy</button></p>
            </div>
        `;
        clientList.appendChild(clientBox);
    });
}

function initializeSortable() {
    new Sortable(document.getElementById('client-list'), {
        animation: 150,
        ghostClass: 'sortable-ghost',
        onEnd: function (/**Event*/evt) {
            console.log('Item moved', evt);
        }
    });
}

function searchClients() {
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    const filterSelect = document.getElementById('filter-select').value;
    const filteredClients = clientsData.filter(client => {
        if (filterSelect === 'all') {
            return Object.values(client).some(value => value.toString().toLowerCase().includes(searchInput));
        } else {
            return client[filterSelect].toString().toLowerCase().includes(searchInput);
        }
    });
    displayClients(filteredClients);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard');
    }).catch(err => {
        console.error('Error copying to clipboard:', err);
    });
}

function callNumber(number) {
    window.location.href = `tel:${number}`;
}
