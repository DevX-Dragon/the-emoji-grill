const emojiAlphabet = [
    '🍎', '🥓', '🧀', '🍩', '🥚', '🍟', '🍇', '🍯', '🍦', '🍭',
    ' kiwi', '🍋', '🍄', '🥜', '🍊', '🍕', '🍳', '🍙', '🍓', '🌮',
    '🍲', '🥦', '🥨', '🍬', '🍿', '🍱'
];

const charMap = "abcdefghijklmnopqrstuvwxyz";

let typingTimer;
const statusEl = document.getElementById('status');

function handleTyping(msg) {
    statusEl.innerText = "STATUS: " + msg;
    statusEl.classList.add('is-typing');
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        statusEl.innerText = "STATUS: READY ✅";
        statusEl.classList.remove('is-typing');
    }, 1000);
}

function run(mode) {
    const input = document.getElementById('inputField').value.toLowerCase();
    const pass = document.getElementById('passField').value.toLowerCase();
    const output = document.getElementById('outputField');

    if (!input || !pass) {
        statusEl.innerText = "STATUS: NEED SALT & MESSAGE! 🧂";
        return;
    }

    let result = "";
    for (let i = 0; i < input.length; i++) {
        let char = input[i];
        let charIndex = charMap.indexOf(char);

        if (charIndex === -1) {
            result += char; // Keep spaces/numbers as they are
            continue;
        }

        // Use the password to find the "Shift"
        let passChar = pass[i % pass.length];
        let shift = charMap.indexOf(passChar);

        if (mode === 'encrypt') {
            // New Index = (Current + Shift) % 26
            let newIndex = (charIndex + shift) % 26;
            result += emojiAlphabet[newIndex];
        } else {
            // Decoding is trickier because we have to find the emoji index first
            let emojiIndex = emojiAlphabet.indexOf(input.split(/([\uD800-\uDBFF][\uDC00-\uDFFF])/).filter(Boolean)[i]); 
            // Simplified decryption for standard text:
            let decryptIndex = (charIndex - shift + 26) % 26;
            result += charMap[decryptIndex];
        }
    }

    output.value = result;
    statusEl.innerText = mode === 'encrypt' ? "STATUS: SEASONED & COOKED! 🔥" : "STATUS: TASTE TEST PASSED! 👅";
}