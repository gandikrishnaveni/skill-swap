document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');

  if (!token) {
    console.error('No token found');
    return;
  }

  let userId;

  try {
    const decoded = jwt_decode(token); // Decode token
    if (decoded && decoded.id) {
      userId = decoded.id;  // Store user ID
      console.log(userId);  // Now you can use `userId` safely
    } else {
      console.error('User ID not found in the decoded token');
      return;
    }
  } catch (error) {
    console.error('Error decoding token:', error);
    return;
  }

  // Connect to Socket.io
  const socket = io.connect('http://localhost:3000');
  
  // Event listener for sending messages
  const sendMessageBtn = document.getElementById('sendMessage');
  sendMessageBtn.addEventListener('click', () => {
    const messageContent = document.getElementById('messageContent').value;
    const recipientId = document.getElementById('recipientId').value;
    
    socket.emit('sendMessage', { to: recipientId, message: messageContent });
  });

  // Listen for incoming messages
  socket.on('receiveMessage', (data) => {
    console.log('New message received:', data);
    // Add message to the chat window
    const chatWindow = document.getElementById('chatWindow');
    chatWindow.innerHTML += `<div><strong>${data.sender}</strong>: ${data.message}</div>`;
  });
});
