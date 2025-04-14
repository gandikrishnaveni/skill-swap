document.addEventListener('DOMContentLoaded', async () => {
    const serviceList = document.getElementById('service-list');
  
    try {
      const res = await fetch('/api/services');
      const services = await res.json();
  
      services.forEach(service => {
        const card = document.createElement('div');
        card.classList.add('service-card');
        card.innerHTML = `
          <h3>${service.title}</h3>
          <p><strong>Category:</strong> ${service.category}</p>
          <p><strong>Description:</strong> ${service.description}</p>
          <p><strong>Posted by:</strong> ${service.postedBy?.name || 'Anonymous'}</p>
          <button onclick="requestService('${service._id}')">Request</button>
        `;
        serviceList.appendChild(card);
      });
    } catch (err) {
      console.error('Error fetching services:', err);
      serviceList.innerHTML = `<p>Failed to load services. Please try again later.</p>`;
    }
  });
  
  async function requestService(serviceId) {
    try {
      const res = await fetch(`/api/services/request/${serviceId}`, {
        method: 'POST',
        credentials: 'include'
      });
  
      const data = await res.json();
      if (res.ok) {
        alert('Request sent successfully!');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (err) {
      console.error('Error requesting service:', err);
      alert('Something went wrong.');
    }
  }
  