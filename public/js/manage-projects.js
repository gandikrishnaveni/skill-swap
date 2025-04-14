document.addEventListener('DOMContentLoaded', async () => {
    try {
      const res = await fetch('/api/projects', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
  
      const data = await res.json();
  
      if (res.ok) {
        const projectsList = document.getElementById('projects-list');
        projectsList.innerHTML = '';
  
        data.projects.forEach(project => {
          const projectCard = document.createElement('div');
          projectCard.classList.add('project-card');
          
          projectCard.innerHTML = `
            <div class="project-info">
              <h3>${project.title}</h3>
              <p>${project.description}</p>
              <p>Status: ${project.status}</p>
              <button class="view-project-btn" data-id="${project._id}">View Project</button>
              <button class="update-project-btn" data-id="${project._id}">Update Status</button>
              <button class="delete-project-btn" data-id="${project._id}">Delete Project</button>
            </div>
          `;
  
          projectsList.appendChild(projectCard);
        });
  
        // Event listeners for action buttons
        document.querySelectorAll('.view-project-btn').forEach(button => {
          button.addEventListener('click', (e) => {
            const projectId = e.target.getAttribute('data-id');
            window.location.href = `/project-details.html?id=${projectId}`;
          });
        });
  
        document.querySelectorAll('.update-project-btn').forEach(button => {
          button.addEventListener('click', async (e) => {
            const projectId = e.target.getAttribute('data-id');
            const newStatus = prompt('Enter new project status:');
            
            if (newStatus) {
              const updateRes = await fetch(`/api/projects/${projectId}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
                credentials: 'include'
              });
  
              const updateData = await updateRes.json();
              if (updateRes.ok) {
                alert('Project status updated!');
                location.reload(); // Refresh the page to show updated status
              } else {
                alert(`Error: ${updateData.message}`);
              }
            }
          });
        });
  
        document.querySelectorAll('.delete-project-btn').forEach(button => {
          button.addEventListener('click', async (e) => {
            const projectId = e.target.getAttribute('data-id');
  
            const deleteRes = await fetch(`/api/projects/${projectId}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include'
            });
  
            const deleteData = await deleteRes.json();
            if (deleteRes.ok) {
              alert('Project deleted!');
              location.reload(); // Refresh the page to remove the deleted project
            } else {
              alert(`Error: ${deleteData.message}`);
            }
          });
        });
  
      } else {
        alert('Failed to fetch projects');
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      alert('Something went wrong.');
    }
  });
  