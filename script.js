// Get the HTML elements
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const chatbox = document.getElementById('chatbox');
const sendButton = document.getElementById('sendButton');

// Function to add a message to the chatbox
function addMessage(message, sender) {
    const messageElement = document.createElement('p');

    // Create and append the sender element safely
    const senderElement = document.createElement('strong');
    senderElement.textContent = `${sender}:`;
    messageElement.appendChild(senderElement);

    // Create and append the message text safely to prevent XSS
    const messageText = document.createTextNode(` ${message}`);
    messageElement.appendChild(messageText);

    chatbox.appendChild(messageElement);
    chatbox.scrollTop = chatbox.scrollHeight; // Auto-scroll to the latest message
}

// Handle form submission
chatForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the form from reloading the page
    
    const userMessage = userInput.value.trim();
    if (!userMessage) return; // Don't send empty messages

    // Display the user's message immediately
    addMessage(userMessage, 'You');
    userInput.value = ''; // Clear the input field
    sendButton.disabled = true; // Disable button while waiting for response

    // Send the message to the n8n webhook
    try {
        const response = await fetch('https://saireddyg.app.n8n.cloud/webhook-test/19fa96ba-6571-4231-b0aa-e3462b077049', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userMessage }),
        });

        const data = await response.json();
        
        // Display the chatbot's response
        addMessage(data.reply, 'Bot');

    } catch (error) {
        console.error('Error:', error);
        addMessage('Sorry, something went wrong.', 'Bot');
    } finally {
        sendButton.disabled = false; // Re-enable the button
    }
});