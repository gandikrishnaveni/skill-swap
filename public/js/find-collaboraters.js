document.addEventListener('DOMContentLoaded', async () => {
    try {
      const res = await fetch('/api/collaborators', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
  
      const data = await res.json();
  
      if (res.ok) {
        const collaboratorsList = document.getElementById('collaborators-list');
        collaboratorsList.innerHTML = '';
  
        data.collaborators.forEach(collaborator => {
          const collaboratorCard = document.createElement('div');
          collaboratorCard.classList.add('collaborator-card');
          
          collaboratorCard.innerHTML = `
            <div class="collaborator-info">
              <h3>${collaborator.name}</h3>
              <p>${collaborator.skills.join(', ')}</p>
              <button class="connect-btn" data-id="${collaborator._id}">Connect</button>
            </div>
          `;
  
          collaboratorsList.appendChild(collaboratorCard);
        });
  
        // Add event listeners for connect buttons
        const connectButtons = document.querySelectorAll('.connect-btn');
        connectButtons.forEach(button => {
          button.addEventListener('click', async (e) => {
            const collaboratorId = e.target.getAttribute('data-id');
  
            const connectRes = await fetch(`/api/collaborators/connect/${collaboratorId}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include'
            });
  
            const connectData = await connectRes.json();
            if (connectRes.ok) {
              alert('You are now connected!');
            } else {
              alert(`Error: ${connectData.message}`);
            }
          });
        });
      } else {
        alert('Failed to fetch collaborators');
      }
    } catch (err) {
      console.error('Error fetching collaborators:', err);
      alert('Something went wrong.');
    }
  });
  