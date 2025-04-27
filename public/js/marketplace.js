document.addEventListener('DOMContentLoaded', async () => {
  const serviceList = document.getElementById('service-list');

  // Check if the service list element exists in the HTML
  if (!serviceList) {
    console.error('Service list element not found.');
    return;
  }

  try {
    const res = await fetch('/api/services');
    
    // Check if the response is successful
    if (!res.ok) {
      throw new Error(`Failed to fetch services. Status: ${res.status}`);
    }

    // If the response is OK, parse the JSON
    let services = await res.json();

    // Handle the case where no services are available
    if (!services.length) {
      services = [
        {
          _id: 'default1',
          title: "Portfolio Website Design",
          category: "Web Development",
          description: "Responsive personal portfolios using HTML/CSS/JS.",
          postedBy: { name: "Krishna" },
          photo: "/web-redesign.jpg"
        },
        {
          _id: 'default2',
          title: "Instagram Reels Editing",
          category: "Video Editing",
          description: "Fast and fun video edits for reels and shorts.",
          postedBy: { name: "Leela" },
          photo: "/edit.jpg"
        }
      ];
    }

    // Add each service as a card in the marketplace
    services.forEach(service => {
      const card = document.createElement('div');
      card.classList.add('card');
      card.innerHTML = `
        <img src="${service.photo}" alt="${service.title}" />
        <h3>${service.title}</h3>
        <p><strong>Category:</strong> ${service.category}</p>
        <p><strong>Description:</strong> ${service.description}</p>
        <p><strong>Posted by:</strong> ${service.postedBy?.name || 'Anonymous'}</p>
        <button onclick="requestService('${service._id}', this)">Request</button>
      `;
      serviceList.appendChild(card);
    });
  } catch (err) {
    console.error('Error fetching services:', err);
    serviceList.innerHTML = `<p>Failed to load services. Please try again later.</p>`;
  }
});

// Function to request a service
async function requestService(serviceId, buttonElement) {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("You're not logged in.");
    window.location.href = "index.html";
    return;
  }

  try {
    const res = await fetch(`/api/services/request/${serviceId}`, {
      method: 'POST',
      headers: {
        "Authorization": "Bearer " + token,  // Pass the token for authentication
      },
      credentials: 'include'  // Optional: Ensure cookies are included, if needed for session management
    });

    // Handle non-200 responses
    if (!res.ok) {
      const errorData = await res.json();  // Get the error message from the response
      alert(`Error: ${errorData.message || 'An error occurred'}`);
      return;
    }

    const data = await res.json();  // If successful, parse the response as JSON
    alert('Request sent successfully!');
    // Update button text and disable it
    buttonElement.textContent = 'Requested';
    buttonElement.disabled = true;
    buttonElement.style.backgroundColor = '#aaa'; // Optional: Make the button look disabled
    buttonElement.style.cursor = 'not-allowed';  // Optional: Change cursor to indicate it's disabled
  } catch (err) {
    console.error('Error requesting service:', err);
    alert('Something went wrong.');
  }
}



