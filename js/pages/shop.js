import { showToast } from '../ui/feedback.js';

let pendingItem = null;
let pendingCost = 0;

function getCurrentBalance() {
    const element = document.getElementById('mice-balance');
    const match = element?.innerText.match(/\d+/);
    return match ? parseInt(match[0], 10) : 50;
}

function setBalance(amount) {
    const element = document.getElementById('mice-balance');
    if (element) element.innerText = `🐭 ${amount} Mice`;
}

function closeModal() {
    const modal = document.getElementById('shop-modal');
    if (modal) modal.style.display = 'none';
    pendingItem = null;
    pendingCost = 0;
}

function tryBuy(itemName, cost) {
    pendingItem = itemName;
    pendingCost = cost;

    const balance = getCurrentBalance();
    const modal = document.getElementById('shop-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    const confirmButton = document.getElementById('modal-confirm-btn');

    if (!modal || !title || !body || !confirmButton) return;

    title.innerText = itemName;
    if (balance < cost) {
        body.innerText = `You need 🐭 ${cost} Mice but only have 🐭 ${balance}. Keep reading and reviewing to earn more!`;
        confirmButton.style.display = 'none';
    } else {
        body.innerText = `Spend 🐭 ${cost} Mice on "${itemName}"? You'll have 🐭 ${balance - cost} Mice remaining.`;
        confirmButton.style.display = 'inline-block';
    }

    modal.style.display = 'flex';
}

export function initShopPage() {
    document.querySelectorAll('.shop-tab').forEach((tab) => {
        if (tab.dataset.bound === 'true') return;

        tab.dataset.bound = 'true';
        tab.addEventListener('click', () => {
            document.querySelectorAll('.shop-tab').forEach((otherTab) => {
                otherTab.classList.remove('active');
            });
            document.querySelectorAll('.tab-content').forEach((content) => {
                content.classList.remove('active');
            });

            tab.classList.add('active');
            const content = document.getElementById(`tab-${tab.dataset.tab}`);
            if (content) content.classList.add('active');
        });
    });

    const confirmButton = document.getElementById('modal-confirm-btn');
    if (confirmButton && confirmButton.dataset.bound !== 'true') {
        confirmButton.dataset.bound = 'true';
        confirmButton.addEventListener('click', () => {
            if (!pendingItem) return;

            const newBalance = getCurrentBalance() - pendingCost;
            setBalance(newBalance);
            closeModal();
            showToast(`✅ "${pendingItem}" purchased!`, {
                background: '#2a7d2a',
            });
        });
    }

    const modal = document.getElementById('shop-modal');
    if (modal && modal.dataset.bound !== 'true') {
        modal.dataset.bound = 'true';
        modal.addEventListener('click', function onBackdropClick(event) {
            if (event.target === this) closeModal();
        });
    }
}

window.tryBuy = tryBuy;
window.closeModal = closeModal;
