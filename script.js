// script.js

const chatForm   = document.getElementById('chatForm');
const userInput  = document.getElementById('userInput');
const chatbox    = document.getElementById('chatbox');
const sendButton = document.getElementById('sendButton');

// 🔁 Change this to your real endpoint
const API_URL = 'https://saireddyg.app.n8n.cloud/webhook/19fa96ba-6571-4231-b0aa-e3462b077049'; 

function addMessage(message, sender = 'Bot') {
  const p = document.createElement('p');
  p.textContent = message;
  p.classList.add(sender === 'You' ? 'user' : 'bot');
  chatbox.appendChild(p);
  chatbox.scrollTop = chatbox.scrollHeight;
  return p; // return node so we can update/remove (for typing indicator)
}

function setUIBusy(isBusy) {
  sendButton.disabled = isBusy;
  userInput.disabled = isBusy && !userInput.value.trim(); // keep editable if they want to correct
}

async function sendToServer(userMessage) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: userMessage }),
  });

  // Throw with readable info for non-2xx
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Request failed (${res.status}): ${text || res.statusText}`);
  }

  // Try JSON; fall back if server returns text
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return await res.json();
  } else {
    const text = await res.text();
    return { reply: text || 'OK' };
  }
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const userMessage = userInput.value.trim();
  if (!userMessage || sendButton.disabled) return;

  addMessage(userMessage, 'You');
  userInput.value = '';
  setUIBusy(true);

  // Typing indicator
  const typingNode = addMessage('…', 'Bot');

  try {
    const data = await sendToServer(userMessage);
    typingNode.textContent = (data && (data.reply ?? data.message)) || 'Sorry, I got an empty reply.';
  } catch (err) {
    console.error(err);
    typingNode.textContent = 'Sorry, something went wrong.';
  } finally {
    setUIBusy(false);
    userInput.focus();
  }
});

userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    // Prevent native form submit if button is disabled
    if (sendButton.disabled) e.preventDefault();
  }
});
