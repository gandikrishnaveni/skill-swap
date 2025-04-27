async function loadProfileInfo() {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3000/api/user-details", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const user = await res.json();
    document.getElementById("dropdown-name").innerText = user.name;
    document.getElementById("dropdown-email").innerText = user.email;
  }

  function toggleProfileMenu() {
    const menu = document.getElementById("profile-dropdown");
    menu.classList.toggle("show");
  }

  function logout() {
    localStorage.removeItem("token");
    alert("Logged out successfully.");
    window.location.href = "login.html";
  }

  document.addEventListener("DOMContentLoaded", loadProfileInfo);