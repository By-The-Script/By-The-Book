export function showInlineMessage(target, message, success = true) {
    const element = typeof target === 'string'
        ? document.getElementById(target)
        : target;

    if (!element) return;

    element.style.display = 'block';
    element.textContent = message;
    element.style.background = success ? '#e8f7ec' : '#ffe9e9';
    element.style.color = success ? '#207245' : '#941C04';
    element.style.border = success
        ? '1px solid #8ed1a5'
        : '1px solid #e3a2a2';

    clearTimeout(element._hideTimer);
    element._hideTimer = setTimeout(() => {
        element.style.display = 'none';
    }, 3000);
}

export function showToast(message, options = {}) {
    const {
        bottom = '30px',
        right = '30px',
        background = '#222',
        color = 'white',
    } = options;

    const toast = document.createElement('div');
    toast.style.cssText = [
        'position:fixed',
        `bottom:${bottom}`,
        `right:${right}`,
        `background:${background}`,
        `color:${color}`,
        'padding:13px 22px',
        'border-radius:50px',
        'font-weight:bold',
        'font-size:14px',
        'z-index:999999',
        'box-shadow:0 5px 20px rgba(0,0,0,0.3)',
    ].join(';');
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
