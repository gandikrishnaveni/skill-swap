// Fetch user data and display on dashboard
document.addEventListener('DOMContentLoaded', async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      const data = await res.json();
  
      if (!res.ok) {
        window.location.href = 'index.html';
        return;
      }
  
      document.getElementById('username').textContent = data.name;
      document.getElementById('email').textContent = data.email;
    } catch (err) {
      console.error('Error loading dashboard:', err);
    }
  });
  
  // Example: Logout functionality
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      window.location.href = 'index.html';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  });
  