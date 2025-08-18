const chatForm   = document.getElementById('chatForm');
const userInput  = document.getElementById('userInput');
const chatbox    = document.getElementById('chatbox');
const sendButton = document.getElementById('sendButton');

// 👉 Replace with your Production Webhook (not test)
const API_URL = "https://saireddyg.app.n8n.cloud/webhook-test/19fa96ba-6571-4231-b0aa-e3462b077049";

function addMessage(message, sender) {
  const p = document.createElement('p');
  p.textContent = message;
  p.classList.add(sender === 'You' ? 'user' : 'bot');
  chatbox.appendChild(p);
  chatbox.scrollTop = chatbox.scrollHeight;
}

async function sendMessage(userMessage) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMessage })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    return await res.json();
  }
  return { reply: await res.text() };
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  addMessage(userMessage, 'You');
  userInput.value = '';
  sendButton.disabled = true;

  // Typing placeholder
  const typing = document.createElement('p');
  typing.textContent = '...';
  typing.classList.add('bot');
  chatbox.appendChild(typing);
  chatbox.scrollTop = chatbox.scrollHeight;

  try {
    const data = await sendMessage(userMessage);
    typing.textContent = data.reply || "No reply received.";
  } catch (err) {
    console.error(err);
    typing.textContent = "Error: " + err.message;
  } finally {
    sendButton.disabled = false;
    userInput.focus();
  }
});
