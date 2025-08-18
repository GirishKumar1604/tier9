const chatForm   = document.getElementById('chatForm');
const userInput  = document.getElementById('userInput');
const chatbox    = document.getElementById('chatbox');
const sendButton = document.getElementById('sendButton');

// ⬇️ Replace with your real endpoint (e.g., https://n8n.yourdomain.com/webhook/chat)
const API_URL = 'https://saireddyg.app.n8n.cloud/webhook/19fa96ba-6571-4231-b0aa-e3462b077049';

function addMessage(message, sender = 'Bot') {
  const p = document.createElement('p');
  p.textContent = message;
  p.classList.add(sender === 'You' ? 'user' : 'bot');
  chatbox.appendChild(p);
  chatbox.scrollTop = chatbox.scrollHeight;
  return p;
}

function setBusy(b) {
  sendButton.disabled = b;
}

async function safeRequest(userMessage) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: userMessage }),
  });

  if (!res.ok) {
    // Try to read body for a helpful error
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText}${text ? ` — ${text}` : ''}`);
  }

  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    return await res.json();
  }
  const text = await res.text();
  return { reply: text || '' };
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const msg = userInput.value.trim();
  if (!msg || sendButton.disabled) return;

  addMessage(msg, 'You');
  userInput.value = '';
  userInput.focus();
  setBusy(true);

  // typing indicator
  const typing = addMessage('…', 'Bot');

  try {
    const data = await safeRequest(msg);
    const reply = (data && (data.reply ?? data.message ?? '')) || '';
    typing.textContent = reply || 'Sorry, I got an empty reply.';
  } catch (err) {
    console.error(err);
    typing.textContent = `Error: ${err.message}`;
  } finally {
    setBusy(false);
  }
});

// Optional: prevent Enter when disabled (IME-safe)
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && sendButton.disabled) e.preventDefault();
});
