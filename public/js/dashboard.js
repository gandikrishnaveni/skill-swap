
let userData = null;

async function loadUserProfile() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch('/api/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });


    // Check if the response is successful before parsing
    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log(data);

    // Display user profile info dynamically
    const userNameElement = document.getElementById('userName');
    const userEmailElement = document.getElementById('userEmail');
    const userSkillsElement = document.getElementById('userSkills');
    const profilePhotoElement = document.getElementById('profile-photo');

    if (userNameElement) userNameElement.innerText = data.name || 'No name provided';
    if (userEmailElement) userEmailElement.innerText = data.email || 'No email provided';
    if (userSkillsElement) userSkillsElement.innerText = data.skills || 'No skills added';
    if (profilePhotoElement) profilePhotoElement.src = data.profilePhoto || "default-profile.png";
    if (data.projects) {
      userProjects = data.projects;
      renderProjects();
    }
    
    // Render services, projects, and activities if available
    if (data.services) renderServices(data.services);
   
    if (data.activities) renderActivities(data.activities);

    // Load notifications
    loadNotifications();
  } catch (err) {
    console.error('Error loading profile:', err);
    alert('Failed to load profile: ' + err.message);
  }
}
// Updated function to load notifications
async function loadNotifications() {
  const notificationList = document.getElementById('notification-list');

  try {
    const response = await fetch('/api/notifications', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      if (data.length === 0) {
        notificationList.innerHTML = `<p>No new notifications.</p>`;
      } else {
        notificationList.innerHTML = ''; // Clear previous notifications
        data.forEach(notification => {
          const notificationItem = document.createElement('div');
          notificationItem.classList.add('notification');
          notificationItem.innerHTML = `
            <p>${notification.message}</p>
            <button class="accept-btn" data-id="${notification._id}">Accept</button>
            <button class="reject-btn" data-id="${notification._id}">Reject</button>
          `;
          notificationList.appendChild(notificationItem);
        });

        // Add event listeners for accepting and rejecting notifications
        document.querySelectorAll('.accept-btn').forEach(button => {
          button.addEventListener('click', async (event) => {
            const notificationId = event.target.getAttribute('data-id');
            try {
              const res = await fetch(`/api/notifications/accept/${notificationId}`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });

              if (res.ok) {
                event.target.closest('.notification').style.opacity = 0.5; // Indicate it's accepted
                alert('Notification accepted');
                event.target.closest('.notification').remove();
              } else {
                alert('Error accepting notification');
              }
            } catch (err) {
              console.error('Error accepting notification:', err);
            }
          });
        });

        document.querySelectorAll('.reject-btn').forEach(button => {
          button.addEventListener('click', async (event) => {
            const notificationId = event.target.getAttribute('data-id');
            try {
              const res = await fetch(`/api/notifications/reject/${notificationId}`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });

              if (res.ok) {
                
                event.target.closest('.notification').style.opacity = 0.5; // Indicate it's rejected
                alert('Notification rejected');
                event.target.closest('.notification').remove();
              } else {
                alert('Error rejecting notification');
              }
            } catch (err) {
              console.error('Error rejecting notification:', err);
            }
          });
        });
      }
    } else {
      alert('Error fetching notifications');
    }
  } catch (err) {
    console.error('Error fetching notifications:', err);
    notificationList.innerHTML = `<p>Failed to load notifications. Please try again later.</p>`;
  }
}   

// dashboard.js

// Function to open Edit Profile modal
// Function to open Edit Profile modal
function editProfile() {
  const modal = document.getElementById('editProfileModal');
  if (modal) {
    modal.style.display = 'block';
    populateEditForm(); // Populate the form with current user data
  } else {
    console.error('Edit Profile modal not found');
  }
}

// Function to populate the Edit Profile form with existing data
function populateEditForm() {
  const name = document.getElementById('userName').innerText;
  const email = document.getElementById('userEmail').innerText;
  const skills = document.getElementById('userSkills').innerText;

  // Fill in the form fields with current user data
  document.getElementById('editName').value = name;
  document.getElementById('editEmail').value = email;
  document.getElementById('editSkills').value = skills;
}

function saveProfile() {
  const name = document.getElementById('editName').value;
  const email = document.getElementById('editEmail').value;
  const skills = document.getElementById('editSkills').value.split(',').map(s => s.trim());

  const updatedData = { name, email, skills };

  console.log('Sending profile update:', updatedData);

  fetch('http://localhost:3000/api/me/update', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(updatedData),
  })
  .then(response => {
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  })
  .then(data => {
    // Update the UI with data returned from server
    document.getElementById('userName').textContent = data.name;
    document.getElementById('userEmail').textContent = data.email;
    document.getElementById('userSkills').textContent = data.skills.join(', ');

    closeModal('editProfileModal');
  })
  .catch(err => {
    console.error('Profile update failed:', err);
    alert('Server error while updating profile.');
  });
}


// Function to close the modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
}


// Function to open Upload Photo modal
function uploadPhoto() {
  const modal = document.getElementById('uploadPhotoModal');
  if (modal) {
    modal.style.display = 'block';
  } else {
    console.error('Upload Photo modal not found');
  }
}

// Close modals when clicking outside of them
window.onclick = function(event) {
  const editModal = document.getElementById('editProfileModal');
  const uploadModal = document.getElementById('uploadPhotoModal');
  if (event.target === editModal) {
    editModal.style.display = 'none';
  }
  if (event.target === uploadModal) {
    uploadModal.style.display = 'none';
  }
}


// Function to upload profile photo
async function uploadProfilePhoto() {
  const photoInput = document.getElementById('photoInput');
  
  if (!photoInput.files.length) {
    alert('Please select a photo to upload.');
    return;
  }

  const formData = new FormData();
  formData.append('photo', photoInput.files[0]);

  try {
    const response = await fetch('/api/me/photo', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      const profilePic = document.getElementById('profile-photo');
      if (profilePic) {
        profilePic.src = data.photoUrl;
      } else {
        console.error('Profile picture element not found.');
      }
      closeModal('uploadPhotoModal');
    } else {
      alert('Error uploading photo');
    }
  } catch (err) {
    console.error('Error uploading photo:', err);
  }
}
// Function to render the projects list
// Function to render the projects list
function renderProjects(projects = []) {
  // Ensure projects is always an array, even if null or undefined
  if (!Array.isArray(projects)) {
    projects = [];
  }

  const projectList = document.getElementById("projects-list");
  if (!projectList) return;

  projectList.innerHTML = `
    <div style="margin-top: 20px;">
      <h4>Add a New Project</h4>
      <input type="text" id="projectName" placeholder="Project Name" style="width: 100%; margin: 6px 0; padding: 10px;" />
      <textarea id="projectDescription" placeholder="Project Description" style="width: 100%; margin: 6px 0; padding: 10px;"></textarea>
      <input type="text" id="projectLink" placeholder="Project Link (e.g., GitHub)" style="width: 100%; margin: 6px 0; padding: 10px;" />
      <button onclick="addProject()" class="edit-btn" style="margin-top: 10px;">Add Project</button>
    </div>
  `;

  // Check if projects are available
  if (projects.length === 0) {
    projectList.innerHTML += `<p>No projects available. Add a new project above!</p>`;
  } else {
    projects.forEach(project => {
      const card = document.createElement('div');
      card.className = 'card-preview';
      card.innerHTML = `
        <strong>${project.title}</strong>
        <p>${project.description}</p>
        <a href="${project.link}" target="_blank" class="message-btn">View Project</a>
      `;

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'edit-btn';
      deleteBtn.innerText = 'Delete';
      deleteBtn.onclick = () => deleteProject(project._id);

      card.appendChild(deleteBtn);
      projectList.appendChild(card);
    });
  }
}




// Fetching user projects from the backend
// Function to fetch projects from the backend and render them
async function fetchProjects() {
  try {
    const res = await fetch('/api/projects/my', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    const result = await res.json();

    // Ensure 'projects' is always an array
    const projects = result.projects || [];

    // Render the projects after fetching them
    renderProjects(projects);
  } catch (err) {
    console.error('Error fetching projects:', err);
    alert('Failed to load projects');
  }
}

// Ensure fetching projects on page load
document.addEventListener('DOMContentLoaded', fetchProjects);


// Function to add a new project
async function addProject() {
  const title = document.getElementById('projectName').value.trim();
  const description = document.getElementById('projectDescription').value.trim();
  const link = document.getElementById('projectLink').value.trim();

  if (!title || !description || !link) {
    alert('Please fill in all fields!');
    return;
  }

  const projectData = {
    title,
    description,
    link,
  };

  try {
    // Send the project data to the backend
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      throw new Error('Error adding project');
    }

    // Optionally, fetch the updated projects list after adding
    fetchProjects();

    // Clear the form inputs after adding the project
    document.getElementById('projectName').value = '';
    document.getElementById('projectDescription').value = '';
    document.getElementById('projectLink').value = '';
  } catch (error) {
    console.error('Error adding project:', error);
    alert('There was an issue adding your project. Please try again.');
  }
}
async function deleteProject(projectId) {
  try {
    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!res.ok) {
      throw new Error('Error deleting project');
    }

    // Reload the projects after deleting
    fetchProjects();
  } catch (error) {
    console.error('Error deleting project:', error);
    alert('Error deleting project');
  }
}




// Optional: Load saved projects from backend/localStorage on load
document.addEventListener('DOMContentLoaded', () => {
  fetchProjects();  // Ensure projects are rendered once the DOM is ready
  loadUserProfile();  // Load user profile

  // Toggle profile popup
  const icon = document.getElementById("profile-container");
  const popup = document.getElementById("profile-popup");
  if (icon && popup) {
    icon.addEventListener("click", () => {
      popup.classList.toggle("hidden");
    });
  }

  // Logout functionality
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      }).then(() => {
        window.location.href = "/index.html";
      });
    });
  }
});
console.log(userData); // Add this to double-check the structure

// Only call renderProjects if userData.projects exists
if (Array.isArray(userData.projects)) {
  renderProjects(userData.projects);
} else {
  console.warn("No projects found in userData, defaulting to empty list");
  renderProjects([]);
}
document.getElementById('addProjectBtn').addEventListener('click', () => {
  const form = document.getElementById('projectForm');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
});







// Initial load
loadUserProfile();

