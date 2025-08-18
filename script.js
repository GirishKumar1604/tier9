// script.js

const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const chatbox = document.getElementById('chatbox');
const sendButton = document.getElementById('sendButton');

// Function to add a message to the chatbox
function addMessage(message, sender) {
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageElement.classList.add(sender === 'You' ? 'user' : 'bot');

    chatbox.appendChild(messageElement);
    chatbox.scrollTop = chatbox.scrollHeight; // Auto-scroll to latest message
}

// Handle form submission
chatForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    addMessage(userMessage, 'You');
    userInput.value = '';
    sendButton.disabled = true;

    try {
        const response = await fetch('https://saireddyg.app.n8n.cloud/webhook/19fa96ba-6571-4231-b0aa-e3462b077049', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userMessage }),
        });

        const data = await response.json();
        addMessage(data.reply, 'Bot');
    } catch (error) {
        console.error('Error:', error);
        addMessage('Sorry, something went wrong.', 'Bot');
    } finally {
        sendButton.disabled = false;
    }
});
