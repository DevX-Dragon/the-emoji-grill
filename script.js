const rawThemes = {
    kitchen: ['🍎','🥓','🧀','🍩','🥚','🍟','🍇','🍯','🍦','🍭','🥝','🍋','🍄','🥜','🍊','🍕'],
    chaos:   ['💀','⛓️','💣','🔋','🔪','🩸','🔥','🦾','⚡','🧨','🔫','👹','🎭','🧠','💥','💢'],
    fusion:  ['🍍','🥑','🌶️','🌮','🌯','🍣','🍤','🍹','🍧','🍨','🥨','🍪','🎂','🍰','🧁','🥧']
};

const clean = (s) => s.normalize('NFC').replace(/[\uFE00-\uFE0F\u200D]/g, '');
const themes = {};
for (const [key, val] of Object.entries(rawThemes)) { themes[key] = val.map(clean); }

let currentMap = themes.kitchen;
const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });

function toggleStealth() { document.getElementById('mainBody').classList.toggle('stealth-mode'); }
function toggleHelp() { 
    document.getElementById('help-content').classList.toggle('open'); 
    document.getElementById('snd-click').play().catch(()=>{}); 
}
function toggleQR(show) { document.getElementById('qr-container').classList.toggle('hidden', !show); }

function checkSaltStrength() {
    const val = document.getElementById('passField').value;
    const bar = document.getElementById('strength-bar');
    const txt = document.getElementById('strength-text');
    let s = 0;
    if (val.length > 5) s += 25;
    if (val.length > 10) s += 25;
    if (/[0-9]/.test(val)) s += 25;
    if (/[^A-Za-z0-9]/.test(val)) s += 25;
    bar.style.width = s + "%";
    bar.style.backgroundColor = s < 50 ? "#f44" : s < 100 ? "#ff0" : "#0f8";
    txt.innerText = "SALT_LEVEL: " + (s === 100 ? "INDUSTRIAL" : s >= 50 ? "TABLE" : "WEAK");
}

function generateQRCode() {
    const data = document.getElementById('outputField').value;
    if(!data) return updateStat("ERROR: EMPTY_OUTPUT");
    document.getElementById('qrcode').innerHTML = "";
    new QRCode(document.getElementById("qrcode"), { text: data, width: 180, height: 180 });
    toggleQR(true);
}

async function handleAction(mode) {
    const input = document.getElementById('inputField').value.trim();
    const pw = document.getElementById('passField').value.trim();
    const output = document.getElementById('outputField');
    if(!input || !pw) return updateStat("ERROR: EMPTY_FIELDS");

    try {
        if(mode === 'encrypt') {
            document.getElementById('snd-sizzle').play().catch(()=>{});
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const key = await getDeriveKey(pw, salt);
            const eb = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, new TextEncoder().encode(input));
            const comb = new Uint8Array(28 + eb.byteLength);
            comb.set(salt, 0); comb.set(iv, 16); comb.set(new Uint8Array(eb), 28);
            let res = ""; 
            const activeMap = themes[document.getElementById('themeSelect').value].map(clean);
            for(let b of comb) { res += activeMap[b >> 4] + activeMap[b & 15]; }
            output.value = res;
            updateStat("COOKED_SUCCESS");
        } else {
            document.getElementById('snd-ding').play().catch(()=>{});
            const ems = Array.from(segmenter.segment(input)).map(s => clean(s.segment));
            const activeMap = detectTheme(ems);
            const bytes = [];
            for(let i=0; i<ems.length; i+=2) { 
                const h = activeMap.indexOf(ems[i]); const l = activeMap.indexOf(ems[i+1]);
                if(h === -1 || l === -1) throw new Error();
                bytes.push((h << 4) | l); 
            }
            const u8 = new Uint8Array(bytes);
            const key = await getDeriveKey(pw, u8.slice(0, 16));
            const dec = await crypto.subtle.decrypt({ name: "AES-GCM", iv: u8.slice(16, 28) }, key, u8.slice(28));
            output.value = new TextDecoder().decode(dec);
            updateStat("EATEN_SUCCESS");
        }
    } catch(e) { updateStat("ERROR: AUTH_FAIL"); }
}

async function getDeriveKey(pw, salt) {
    const enc = new TextEncoder();
    const bk = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({ name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" }, bk, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

function detectTheme(ems) {
    for (let key in themes) { if (themes[key].includes(ems[0])) return themes[key]; }
    return currentMap;
}

function generatePass() { document.getElementById('passField').value = `SALT-${Math.floor(Math.random()*999999)}`; checkSaltStrength(); }
function updateStat(m) { const s = document.getElementById('status-display'); s.innerText = m; s.style.background = m.includes("ERR") ? "#f44" : "#0f8"; }
function togglePassword() { const p = document.getElementById('passField'); p.type = p.type === 'password' ? 'text' : 'password'; }
function copyText() { const e = document.getElementById('outputField'); e.select(); navigator.clipboard.writeText(e.value); updateStat("COPIED"); }
function changeTheme() { currentMap = themes[document.getElementById('themeSelect').value]; updateStat("THEME_LOCKED"); }

function handleFileSelect(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('inputField').value = `FILE_DATA:${file.name}:${e.target.result}`;
        document.getElementById('file-name-display').innerText = file.name;
        updateStat("FILE_ATTACHED");
    };
    reader.readAsDataURL(file);
}

function triggerExplosion() {
    let c = 3; const o = document.getElementById('panic-overlay'); const t = document.getElementById('panic-timer');
    o.classList.remove('hidden'); o.classList.add('show');
    const iv = setInterval(() => {
        c--; t.innerText = c;
        if(c <= 0) { clearInterval(iv); o.classList.remove('show'); o.classList.add('hidden'); shatter(); }
    }, 1000);
}

function shatter() {
    const els = document.querySelectorAll('.io-zone > *');
    els.forEach(el => {
        el.style.setProperty('--x', `${(Math.random()-0.5)*1000}px`);
        el.style.setProperty('--y', `${(Math.random()-0.5)*1000}px`);
        el.style.setProperty('--r', `${(Math.random()-0.5)*1000}deg`);
        el.classList.add('exploding');
    });
    setTimeout(() => {
        document.querySelectorAll('input, textarea').forEach(i => i.value = "");
        els.forEach(el => el.classList.remove('exploding'));
        updateStat("REBOOTED");
    }, 800);
}