document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('message-input');
    const messageButton = document.getElementById('message-button');
    const messagesContainer = document.getElementById('messages-container');
    const userId = document.getElementById('user-id').value; // Assuming user ID is stored in a hidden input field
    const peerId = document.getElementById('peer-id').value; // The ID of the user you're chatting with, also stored in a hidden input field
  
    // Send message event listener
    messageButton.addEventListener('click', async () => {
      const messageText = messageInput.value.trim();
  
      if (messageText) {
        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: userId,
              to: peerId,
              message: messageText,
            }),
            credentials: 'include'
          });
  
          const data = await res.json();
          if (res.ok) {
            messageInput.value = ''; // Clear input after sending
            addMessageToUI(data.message);
          } else {
            alert(`Error: ${data.message}`);
          }
        } catch (err) {
          console.error('Error sending message:', err);
          alert('Something went wrong.');
        }
      }
    });
  
    // Fetch and display messages
    async function loadMessages() {
      try {
        const res = await fetch(`/api/chat/${userId}/${peerId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
  
        const data = await res.json();
        if (res.ok) {
          data.messages.forEach(message => addMessageToUI(message));
        } else {
          alert('Failed to load messages.');
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        alert('Something went wrong.');
      }
    }
  
    // Function to display a message in the chat window
    function addMessageToUI(message) {
      const messageElement = document.createElement('div');
      messageElement.classList.add('message');
      messageElement.textContent = message.text;
      messagesContainer.appendChild(messageElement);
      messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to the bottom of the chat
    }
  
    // Initialize chat
    loadMessages();
  
    // Optionally, you could set up a WebSocket or polling for real-time updates here.
  });
  