let collaborators = [];

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login again');
    window.location.href = 'login.html';
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/collaborators', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Failed to fetch collaborators');
      return;
    }

    collaborators = data.collaborators;
    const collaboratorsList = document.getElementById('collaborators-list');
    collaboratorsList.innerHTML = '';

    collaborators.forEach(collaborator => {
      const card = document.createElement('div');
      card.classList.add('collaborator-card');
      card.innerHTML = `
        <div class="collaborator-info">
          <img src="${collaborator.profilePhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(collaborator.name) + '&size=90&background=random'}" class="profile-img" />
          <h3>${collaborator.name}</h3>
          <p>${collaborator.skills.join(', ')}</p>
   <p><strong>Status:</strong> 
  <span class="badge ${collaborator.profileType === 'Paid' ? 'paid' : 'free'}">
    ${collaborator.profileType === 'Paid' ? 'Paid' : 'Free'}
  </span>
</p>


          <p style="display:none;" class="email">${collaborator.email}</p>

          <button class="connect-btn" data-id="${collaborator._id}">Connect</button>
          <button class="view-profile-btn">View Profile</button>
        </div>
      `;
      card.querySelector('.view-profile-btn').addEventListener('click', () => openModal(collaborator._id));
      card.querySelector('.connect-btn').addEventListener('click', function () {
        connectRequest(this);
      });

      collaboratorsList.appendChild(card);
    });

  } catch (err) {
    console.error('Fetch error:', err);
    alert('Something went wrong fetching collaborators');
  }
});

async function connectRequest(button) {
  const targetId = button.getAttribute('data-id');
  const token = localStorage.getItem('token');

  if (!token) {
    alert('You must be logged in to connect');
    return;
  }

  console.log("Target ID:", targetId); // Debugging line to check targetId

  try {
    const res = await fetch(`http://localhost:3000/api/collaborators/connect/${targetId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.log('Error response:', errorData);
      alert(errorData.error || 'Failed to send request');
      return;
    }

    const data = await res.json();

    console.log('Connection successful:', data);
    button.innerText = "Requested";
    button.disabled = true;

    // Create connection notification
    const receiverId = targetId; // The target collaborator
    const sender = await fetch(`http://localhost:3000/api/me`, 
      { // Get logged-in user's name
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }).then(res => res.json());
    
    const message = `${sender.name} wants to connect with you.`;
    await createNotification(receiverId, message, '/connections', 'connection'); // Send the connection notification

    alert(data.message || "Connect request sent!");
  } catch (err) {
    console.error('Catch Error:', err);
    alert("Something went wrong.");
  }
}

async function createNotification(receiverId, message, link = '') {
  const token = localStorage.getItem('token');

  if (!token) {
    alert('You must be logged in to create notifications');
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: receiverId,
        message,
        link,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.log('Error response:', errorData);
      alert(errorData.error || 'Failed to create notification');
      return;
    }

    console.log('Notification created successfully');
  } catch (err) {
    console.error('Error creating notification:', err);
    alert('Failed to create notification');
  }
}

function filterProfiles() {
  let input = document.getElementById('skillFilter').value.toLowerCase();
  let profiles = document.querySelectorAll('.collaborator-card');

  profiles.forEach(profile => {
    let skills = profile.querySelector('p').textContent.toLowerCase(); // Adjusted here

    if (skills.includes(input)) {
      profile.style.display = "block";
    } else {
      profile.style.display = "none";
    }
  });
}

async function openModal(collaboratorId) {
  const token = localStorage.getItem('token');
  const modal = document.getElementById('profileModal');
  const modalContent = document.getElementById('modalContent');

  try {
    const res = await fetch(`http://localhost:3000/api/collaborators/${collaboratorId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Failed to fetch collaborator details');
      return;
    }

    let projectsHTML = '<ul>';
    if (Array.isArray(data.projects) && data.projects.length > 0) {
      data.projects.forEach(project => {
        projectsHTML += `<li><strong>${project.title}</strong>: ${project.description}</li>`;
      });
    } else {
      projectsHTML += '<li>No projects posted yet.</li>';
    }
    projectsHTML += '</ul>';

    modalContent.innerHTML = `
      <h3>${data.name}</h3>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Skills:</strong> ${data.skills.join(', ')}</p>
      <h4>Projects</h4>
      ${projectsHTML}
    `;

    modal.style.display = 'flex';
  } catch (err) {
    console.error('Error fetching collaborator details:', err);
    alert('Failed to fetch collaborator details.');
  }
}

function closeModal() {
  document.getElementById('profileModal').style.display = 'none';
}

   