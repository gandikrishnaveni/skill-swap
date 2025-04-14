document.addEventListener('DOMContentLoaded', () => {
    const postServiceForm = document.getElementById('post-service-form');
    
    postServiceForm.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const title = document.getElementById('title').value;
      const description = document.getElementById('description').value;
      const category = document.getElementById('category').value;
  
      const serviceData = {
        title,
        description,
        category
      };
  
      try {
        const res = await fetch('/api/services', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(serviceData),
          credentials: 'include'
        });
  
        const data = await res.json();
        if (res.ok) {
          alert('Service posted successfully!');
          window.location.href = '/marketplace.html';  // Redirect to the marketplace
        } else {
          alert(`Error: ${data.message}`);
        }
      } catch (err) {
        console.error('Error posting service:', err);
        alert('Something went wrong.');
      }
    });
  });
  