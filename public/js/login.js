// login.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault(); // Prevent default form submission
  
      const email = emailInput.value;
      const password = passwordInput.value;
  
      try {
        const response = await fetch('http://localhost:3000/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }), // Sending email and password to backend
        });
  
        const data = await response.json();
  
        if (response.ok) {
          // Store the token in localStorage
          localStorage.setItem('token', data.token);
          alert('Login successful');
          loadUserProfile();
          window.location.href = 'dashboard.html';  // Redirect to dashboard or the next page
        } else {
          alert('Login failed: ' + data.error);
        }
      } catch (err) {
        console.error('Error logging in:', err);
        alert('An error occurred while logging in');
      }
    });
  });
  