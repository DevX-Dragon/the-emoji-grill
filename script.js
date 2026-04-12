const emojiAlphabet = ['🍎', '🥓', '🧀', '🍩', '🥚', '🍟', '🍇', '🍯', '🍦', '🍭', ' kiwi', '🍋', '🍄', '🥜', '🍊', '🍕', '🍳', '🍙', '🍓', '🌮', '🍲', '🥦', '🥨', '🍬', '🍿', '🍱'];
const alpha = "abcdefghijklmnopqrstuvwxyz";

const playSnd = (id) => {
    const s = document.getElementById(id);
    if (!s) return;
    s.currentTime = 0;
    s.play().catch(() => {});
};

const updateStatus = (msg) => {
    const status = document.getElementById('status-display');
    status.innerHTML = `${msg}<span class="cursor">_</span>`;
};

// Typing indicators for Pass field
document.getElementById('passField').addEventListener('input', (e) => {
    const val = e.target.value;
    const bar = document.getElementById('heat-fill');
    const label = document.getElementById('heat-text');
    const strength = Math.min(val.length * 10, 100);
    
    bar.style.width = strength + "%";
    label.innerText = `VOLTAGE: ${(strength * 0.12).toFixed(1)}V`;
    
    updateStatus("INJECTING_SALT");
    playSnd('snd-click');

    clearTimeout(window.typeTimer);
    window.typeTimer = setTimeout(() => updateStatus("SYS_READY"), 1000);
});

document.getElementById('inputField').addEventListener('input', () => {
    updateStatus("PREPPING_INGREDIENTS");
    clearTimeout(window.typeTimer);
    window.typeTimer = setTimeout(() => updateStatus("SYS_READY"), 1000);
});

function cook(text, salt) {
    let res = "";
    let sIdx = 0;
    for (let c of text.toLowerCase()) {
        const idx = alpha.indexOf(c);
        if (idx === -1) { res += c; continue; }
        const shift = alpha.indexOf(salt[sIdx % salt.length].toLowerCase());
        res += emojiAlphabet[(idx + shift) % 26];
        sIdx++;
    }
    return res;
}

function eat(emojiText, salt) {
    let res = "";
    let sIdx = 0;
    const arr = [...emojiText];
    for (let e of arr) {
        const idx = emojiAlphabet.indexOf(e);
        if (idx === -1) { res += e; continue; }
        const shift = alpha.indexOf(salt[sIdx % salt.length].toLowerCase());
        res += alpha[(idx - shift + 26) % 26];
        sIdx++;
    }
    return res;
}

function run(mode) {
    const input = document.getElementById('inputField').value;
    const salt = document.getElementById('passField').value.trim();
    const output = document.getElementById('outputField');

    if (!input || !salt) {
        updateStatus("ERROR: NULL_DATA");
        return;
    }

    if (mode === 'encrypt') {
        playSnd('snd-sizzle');
        output.value = cook(input, salt);
        updateStatus("ORDER_COOKED");
    } else {
        playSnd('snd-ding');
        output.value = eat(input, salt);
        updateStatus("ORDER_SERVED");
    }
}

function copyText() {
    const el = document.getElementById('outputField');
    if (!el.value) return;
    el.select();
    navigator.clipboard.writeText(el.value);
    updateStatus("CLIPBOARD_PULLED");
    setTimeout(() => updateStatus("SYS_READY"), 2000);
}