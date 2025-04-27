document.addEventListener('DOMContentLoaded', () => {
  const serviceContainer = document.getElementById('service-container');
  const token = localStorage.getItem('token');

  if (!token) {
    return (serviceContainer.innerHTML = "<p>Please log in to view your services.</p>");
  }

  // Fetching the user's services
  fetch('/api/services/my', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(res => {
      if (!res.ok) {
        throw new Error('Failed to fetch services. Status: ' + res.status);
      }
      return res.json();
    })
    .then(services => {
      if (!services || services.length === 0) {
        addServiceCard({
          title: 'No Services Yet',
          description: 'Once you create services, they will show up here.',
          image: 'https://placekitten.com/100/100',
          _id: 'default'
        });
      } else {
        services.forEach(service => {
          console.log('Service Image:', service.image); // Log the image URL
          addServiceCard(service);
        });
      }
    })
    .catch(err => {
      console.error('Error fetching services:', err);
      addServiceCard({
        title: 'Sample Service',
        description: 'Could not fetch real services. This is a placeholder.',
        image: 'https://placekitten.com/100/100',
        _id: 'default'
      });
    });

  // Function to create service cards and display them
  function addServiceCard(service) {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.innerHTML = `
      <img src="${service.photo || 'https://placekitten.com/100/100'}" alt="${service.title}" class="service-img" >
      <div class="service-info">
        <h3>${service.title}</h3>
        <p>${service.description}</p>
        ${service._id !== 'default' ? `
          <button class="delete-btn" data-id="${service._id}">Delete</button>
        ` : ''}
      </div>
    `;
    serviceContainer.appendChild(card);

    if (service._id !== 'default') {
      // Adding the delete button functionality
      card.querySelector('.delete-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this service?')) {
          deleteService(service._id, card);
        }
      });
    }
  }

  function deleteService(serviceId, card) {
    const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage
    
    if (!token) {
      alert('You must be logged in to delete a service.');
      return;
    }
  
    fetch(`/api/services/${serviceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' // Ensure the server expects this content type
      }
    })
    .then(res => {
      if (res.ok) {
        // Successfully deleted, remove the card from the UI
        card.remove();
        alert('Service deleted successfully!');
      } else {
        // Handle the error response
        return res.json().then(data => {
          throw new Error(data.error || 'Failed to delete service.');
        });
      }
    })
    .catch(err => {
      console.error('Error deleting service:', err);
      alert('Error deleting the service: ' + err.message);
    });
  }
  
});

